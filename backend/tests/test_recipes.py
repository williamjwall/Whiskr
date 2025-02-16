import requests
import uuid

BASE_URL = "http://localhost:5000/api"

def create_test_user():
    """Register a new user with a unique email and return the JSON response."""
    unique_email = f"testuser_{uuid.uuid4()}@example.com"
    payload = {"email": unique_email, "password": "testpassword"}
    response = requests.post(f"{BASE_URL}/users/register", json=payload)
    assert response.status_code == 201, f"User registration failed: {response.status_code}"
    return response.json()

def create_test_recipe(user_id):
    """Create a new recipe for the given user and return the JSON response."""
    unique_title = f"Test Recipe {uuid.uuid4()}"
    payload = {
        "title": unique_title,
        "content": "This is a test recipe.",
        "user_id": user_id
    }
    response = requests.post(f"{BASE_URL}/recipes", json=payload)
    assert response.status_code == 201, f"Recipe creation failed: {response.status_code}"
    return response.json()

def test_create_and_get_recipe():
    # Create a test user and a recipe for that user.
    user = create_test_user()
    user_id = user["id"]
    recipe = create_test_recipe(user_id)
    recipe_id = recipe["id"]

    # Retrieve the recipe by its ID.
    response = requests.get(f"{BASE_URL}/recipes/{recipe_id}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    retrieved_recipe = response.json()
    assert retrieved_recipe["id"] == recipe_id
    assert retrieved_recipe["title"] == recipe["title"]
    assert retrieved_recipe["content"] == recipe["content"]

def test_update_recipe():
    # Create a test user and a recipe.
    user = create_test_user()
    user_id = user["id"]
    recipe = create_test_recipe(user_id)
    recipe_id = recipe["id"]

    # Update the recipe's title and content.
    updated_payload = {
        "title": recipe["title"] + " Updated",
        "content": recipe["content"] + " Updated"
    }
    response = requests.put(f"{BASE_URL}/recipes/{recipe_id}", json=updated_payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    updated_recipe = response.json()
    assert updated_recipe["title"] == updated_payload["title"]
    assert updated_recipe["content"] == updated_payload["content"]

def test_delete_recipe():
    # Create a test user and a recipe.
    user = create_test_user()
    user_id = user["id"]
    recipe = create_test_recipe(user_id)
    recipe_id = recipe["id"]

    # Delete the recipe.
    response = requests.delete(f"{BASE_URL}/recipes/{recipe_id}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    # Attempt to retrieve the deleted recipe (should return 404).
    response = requests.get(f"{BASE_URL}/recipes/{recipe_id}")
    assert response.status_code == 404, f"Expected 404 after deletion, got {response.status_code}"

def test_search_recipe():
    # Create a test user.
    user = create_test_user()
    user_id = user["id"]

    # Use a unique keyword for the recipe title.
    unique_keyword = str(uuid.uuid4())
    payload = {
        "title": f"Special Recipe {unique_keyword}",
        "content": "Delicious recipe with a secret ingredient.",
        "user_id": user_id
    }
    response = requests.post(f"{BASE_URL}/recipes", json=payload)
    assert response.status_code == 201, f"Failed to create recipe for search test: {response.status_code}"

    # Search for the recipe using the unique keyword.
    response = requests.get(f"{BASE_URL}/recipes?search={unique_keyword}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    recipes = response.json()
    # Ensure that at least one of the returned recipes has the unique keyword in its title.
    assert any(unique_keyword in recipe["title"] for recipe in recipes), "Search did not return the expected recipe"
