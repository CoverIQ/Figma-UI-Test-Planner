import unittest
from ..feature_representation import filter_component

class TestFeatureRepresentation(unittest.TestCase):
    def test_filter_component_empty_data(self):
        """Test filter_component with empty data"""
        input_data = {"figma_data": {"document": {}}}
        result = filter_component(input_data)
        self.assertEqual(result["figma_data"], [])
        self.assertIsNone(result["feature_description"])

    def test_filter_component_with_interactions(self):
        """Test filter_component with a node containing interactions"""
        input_data = {
            "figma_data": {
                "document": {
                    "id": "1",
                    "name": "Test Node",
                    "type": "FRAME",
                    "interactions": [{"type": "CLICK"}],
                    "absoluteBoundingBox": {"x": 0, "y": 0, "width": 100, "height": 100},
                    "children": []
                }
            }
        }
        result = filter_component(input_data)
        self.assertEqual(len(result["figma_data"]), 1)
        self.assertEqual(result["figma_data"][0]["id"], "1")
        self.assertEqual(result["figma_data"][0]["interactions"], [{"type": "CLICK"}])

    def test_filter_component_with_style_override(self):
        """Test filter_component with a node containing style overrides"""
        input_data = {
            "figma_data": {
                "document": {
                    "id": "1",
                    "name": "Test Node",
                    "type": "FRAME",
                    "styleOverrideTable": {"color": "#000000"},
                    "absoluteBoundingBox": {"x": 0, "y": 0, "width": 100, "height": 100},
                    "children": []
                }
            }
        }
        result = filter_component(input_data)
        self.assertEqual(len(result["figma_data"]), 1)
        self.assertEqual(result["figma_data"][0]["styleOverrideTable"], {"color": "#000000"})

    def test_filter_component_with_feature_description(self):
        """Test filter_component with feature description"""
        input_data = {"figma_data": {"document": {}}}
        feature_desc = "Test feature description"
        result = filter_component(input_data, feature_desc)
        self.assertEqual(result["feature_description"], feature_desc)

if __name__ == '__main__':
    unittest.main() 