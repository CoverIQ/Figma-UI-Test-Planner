from typing import Dict, Any, List, Optional

# to filter decorative component in json file and keep all necessary information

def filter_component(figma_data: Dict[str, Any],feature_description: Optional[str] = None) -> List[Dict[str, Any]]:

    results = []
    #Traverse frame node tree to extract interactive components
    def traverse(node: Dict[str, Any],parent_id : Any = None):
        interactions = node.get("interactions", [])
        table = node.get("styleOverrideTable", [])
        #keep element if not decorative
        if (interactions or table) :  
            component = {
                "parent_id": parent_id,
                "id": node.get("id"),
                "name": node.get("name"),
                "type": node.get("type"),
                "position": {
                    "x": node.get("absoluteBoundingBox", {}).get("x"),
                    "y": node.get("absoluteBoundingBox", {}).get("y")
                },
                "size": {
                    "width": node.get("absoluteBoundingBox", {}).get("width"),
                    "height": node.get("absoluteBoundingBox", {}).get("height")
                },
                "interactions": node.get("interactions"),
                "styleOverrideTable": node.get("styleOverrideTable")
            }
            results.append(component)


        for child in node.get("children", []):
            traverse(child,node.get("id"))

    # start from "document"
    if "document" in figma_data["figma_data"]:
        traverse(figma_data["figma_data"]["document"])
    output = {
        "figma_data" : results,
        "feature_description" : feature_description
    }
    
    return output


if __name__ == "__main__":
    import argparse
    import json
    parser = argparse.ArgumentParser(description="get json file from path")
    parser.add_argument("json_path", help="json file path")
    parser.add_argument("--feature_path",  help="Optional feature description text file",default=None)
    args = parser.parse_args()
    with open(args.json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if args.feature_path :
        with open(args.feature_path, "r", encoding="utf-8") as f:
            feature_description = f.read()
        feature_list = filter_component(data , feature_description)
    else :
        feature_list = filter_component(data )

    with open("feature_representation.json", "w", encoding="utf-8") as f:
        json.dump(feature_list, f, ensure_ascii=False, indent=2)
