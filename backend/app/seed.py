from app.data.build_destinations import build_destination_records
from app.database import Base, SessionLocal, engine
from app.models import Destination


def seed_destinations() -> None:
    Base.metadata.create_all(bind=engine)
    destination_records = build_destination_records()

    db = SessionLocal()

    try:
        deleted_count = db.query(Destination).delete()
        print(f"Deleted {deleted_count} existing destinations")

        for destination_data in destination_records:
            destination = Destination(
                name=destination_data["name"],
                country=destination_data["country"],
                region=destination_data["region"],
                description=destination_data["description"],
                image=destination_data["image"],
                detail=destination_data["detail"],
                best_time=destination_data["best_time"],
                visit_duration=destination_data["visit_duration"],
                budget_level=destination_data["budget_level"],
                vibes=destination_data["vibes"],
                gallery=destination_data["gallery"],
                neighbourhoods=destination_data["neighbourhoods"],
            )

            db.add(destination)

        db.commit()
        print(f"Seeded {len(destination_records)} destinations")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_destinations()
