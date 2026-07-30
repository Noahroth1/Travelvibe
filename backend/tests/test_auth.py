import unittest

from app.database import SessionLocal, Base, engine
from app.models import User
from app.routes.auth import login_user, register_user


class AuthTests(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        db.query(User).delete()
        db.commit()
        db.close()

    def tearDown(self):
        db = SessionLocal()
        db.query(User).delete()
        db.commit()
        db.close()

    def test_register_and_login_flow(self):
        db = SessionLocal()
        created_user = register_user(db, "test@example.com", "Secret123!")
        self.assertEqual(created_user.email, "test@example.com")
        self.assertTrue(created_user.password_hash)

        logged_in = login_user(db, "test@example.com", "Secret123!")
        self.assertTrue(logged_in["token"])
        db.close()


if __name__ == "__main__":
    unittest.main()
