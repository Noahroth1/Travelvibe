import unittest

from pydantic import ValidationError

from app.schemas import TripCreate, TripUpdate


class TripSchemaTests(unittest.TestCase):
    def test_trip_create_accepts_destination_names(self) -> None:
        trip = TripCreate(
            name="Summer Europe",
            travel_date="August 2026",
            destinations=[
                {"destination": "Paris", "days": 4, "neighbourhood": "Le Marais"},
                {"destination": "Porto", "days": 3},
            ],
        )

        self.assertEqual(trip.destinations[0].days, 4)
        self.assertEqual(trip.destinations[0].neighbourhood, "Le Marais")

    def test_legacy_destination_names_are_upgraded(self) -> None:
        trip = TripCreate(name="Legacy trip", destinations=["Paris"])

        self.assertEqual(trip.destinations[0].destination, "Paris")
        self.assertEqual(trip.destinations[0].days, 1)

    def test_trip_update_preserves_explicit_null_date(self) -> None:
        update = TripUpdate(travel_date=None)

        self.assertEqual(update.model_dump(exclude_unset=True), {"travel_date": None})

    def test_trip_name_must_not_be_blank(self) -> None:
        with self.assertRaises(ValidationError):
            TripCreate(name="")


if __name__ == "__main__":
    unittest.main()
