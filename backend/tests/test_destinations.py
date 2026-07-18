import unittest

from app.data.build_destinations import build_destination_records
from app.schemas import DestinationResponse


VALID_REGIONS = {"Europe", "Asia", "Americas", "Middle East", "Oceania", "Africa"}
VALID_BUDGETS = {"$", "$$", "$$$"}
VALID_VIBES = {"Beach", "City Break", "Culture", "Adventure", "Food"}


class DestinationDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.destinations = build_destination_records()

    def test_seed_contains_36_unique_destinations(self) -> None:
        names = [destination["name"] for destination in self.destinations]

        self.assertEqual(len(names), 36)
        self.assertEqual(len(set(names)), 36)

    def test_every_destination_has_travel_metadata(self) -> None:
        for destination in self.destinations:
            with self.subTest(destination=destination["name"]):
                self.assertTrue(destination["best_time"])
                self.assertTrue(destination["visit_duration"])
                self.assertIn(destination["budget_level"], VALID_BUDGETS)
                self.assertTrue(destination["vibes"])
                self.assertLessEqual(set(destination["vibes"]), VALID_VIBES)
                self.assertIn(destination["region"], VALID_REGIONS)

    def test_neighbourhoods_have_valid_shapes(self) -> None:
        for destination in self.destinations:
            self.assertTrue(destination["neighbourhoods"], destination["name"])

            for neighbourhood in destination["neighbourhoods"]:
                with self.subTest(
                    destination=destination["name"],
                    neighbourhood=neighbourhood["name"],
                ):
                    self.assertTrue(neighbourhood["name"])
                    self.assertTrue(neighbourhood["vibe"])
                    self.assertIsInstance(neighbourhood["tips"], list)
                    self.assertTrue(all(isinstance(tip, str) and tip for tip in neighbourhood["tips"]))

    def test_every_record_matches_the_api_schema(self) -> None:
        for index, destination in enumerate(self.destinations, start=1):
            with self.subTest(destination=destination["name"]):
                response = DestinationResponse.model_validate({"id": index, **destination})
                self.assertEqual(response.name, destination["name"])


if __name__ == "__main__":
    unittest.main()
