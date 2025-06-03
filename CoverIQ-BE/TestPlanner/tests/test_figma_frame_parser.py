import unittest
from unittest.mock import patch, MagicMock
from ..figma_frame_parser import parse_figma_url, get_figma_file_data

class TestFigmaFrameParser(unittest.TestCase):
    def test_parse_figma_url_valid_file(self):
        """Test parse_figma_url with a valid file URL"""
        url = "https://www.figma.com/file/abc123/design"
        result = parse_figma_url(url)
        self.assertEqual(result, "abc123")

    def test_parse_figma_url_valid_design(self):
        """Test parse_figma_url with a valid design URL"""
        url = "https://www.figma.com/design/xyz789/design"
        result = parse_figma_url(url)
        self.assertEqual(result, "xyz789")

    def test_parse_figma_url_invalid(self):
        """Test parse_figma_url with an invalid URL"""
        url = "https://www.figma.com/invalid/abc123"
        with self.assertRaises(ValueError):
            parse_figma_url(url)

    @patch('requests.get')
    def test_get_figma_file_data_success(self, mock_get):
        """Test get_figma_file_data with successful API response"""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = {"name": "Test File"}
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = get_figma_file_data("abc123", "test_token")
        self.assertEqual(result, {"name": "Test File"})
        mock_get.assert_called_once_with(
            "https://api.figma.com/v1/files/abc123",
            headers={'X-Figma-Token': 'test_token'}
        )

    @patch('requests.get')
    def test_get_figma_file_data_error(self, mock_get):
        """Test get_figma_file_data with API error"""
        # Mock response with error
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("API Error")
        mock_get.return_value = mock_response

        with self.assertRaises(Exception):
            get_figma_file_data("abc123", "test_token")

if __name__ == '__main__':
    unittest.main() 