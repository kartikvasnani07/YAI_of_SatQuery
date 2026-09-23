import os
import json
import uuid

PROJECTS_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs", "projects_data.json"))

def load_projects_data():
    if os.path.exists(PROJECTS_FILE):
        try:
            with open(PROJECTS_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass

    # Default initial project structure
    default_data = {
        "active_project_id": "proj_default",
        "projects": [
            {
                "id": "proj_default",
                "name": "General Satellite Analysis",
                "created_at": "2026-09-20T12:00:00Z",
                "chats": []
            }
        ]
    }
    save_projects_data(default_data)
    return default_data

def save_projects_data(data):
    os.makedirs(os.path.dirname(PROJECTS_FILE), exist_ok=True)
    with open(PROJECTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

def create_project(name):
    data = load_projects_data()
    proj_id = f"proj_{uuid.uuid4().hex[:8]}"
    new_proj = {
        "id": proj_id,
        "name": name,
        "created_at": "2026-09-20T13:00:00Z",
        "chats": []
    }
    data["projects"].append(new_proj)
    data["active_project_id"] = proj_id
    save_projects_data(data)
    return new_proj

def add_chat_to_project(project_id, chat_entry):
    data = load_projects_data()
    for proj in data["projects"]:
        if proj["id"] == project_id:
            proj["chats"].append(chat_entry)
            save_projects_data(data)
            return True
    return False

def delete_chat_from_project(project_id, chat_id):
    data = load_projects_data()
    for proj in data["projects"]:
        if proj["id"] == project_id:
            initial_count = len(proj["chats"])
            proj["chats"] = [c for c in proj["chats"] if str(c.get("id")) != str(chat_id)]
            save_projects_data(data)
            return len(proj["chats"]) < initial_count
    return False

def clear_project_chats(project_id):
    data = load_projects_data()
    for proj in data["projects"]:
        if proj["id"] == project_id:
            proj["chats"] = []
            save_projects_data(data)
            return True
    return False
