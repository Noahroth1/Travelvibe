import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException
from starlette.requests import Request

from app.auth import require_user_id
from app.schemas import UserStateResponse, UserStateUpdate


def make_request() -> Request:
    return Request({"type": "http", "method": "GET", "path": "/", "headers": []})


class ClerkAuthenticationTests(unittest.TestCase):
    @patch("app.auth.authenticate_request")
    def test_returns_verified_subject(self, authenticate_request) -> None:
        authenticate_request.return_value = SimpleNamespace(
            is_signed_in=True,
            payload={"sub": "user_123"},
            reason=None,
        )

        self.assertEqual(require_user_id(make_request()), "user_123")

    @patch("app.auth.authenticate_request")
    def test_rejects_signed_out_request(self, authenticate_request) -> None:
        authenticate_request.return_value = SimpleNamespace(
            is_signed_in=False,
            payload=None,
            reason=None,
        )

        with self.assertRaises(HTTPException) as raised:
            require_user_id(make_request())

        self.assertEqual(raised.exception.status_code, 401)


class UserStateSchemaTests(unittest.TestCase):
    def test_new_account_state_has_safe_defaults(self) -> None:
        state = UserStateResponse(initialized=False)

        self.assertEqual(state.saved_order, [])
        self.assertEqual(state.notes, {})
        self.assertFalse(state.dark_mode)

    def test_layout_mode_is_validated(self) -> None:
        state = UserStateUpdate(layout_mode="list")

        self.assertEqual(state.layout_mode, "list")


if __name__ == "__main__":
    unittest.main()
