import requests
import uuid

BASE_URL = "http://localhost:5000/api"

def test_register_user():
    url = f"{BASE_URL}/users/register"
    unique_email = f"pytest_{uuid.uuid4()}@example.com"
    payload = {
        "email": unique_email,
        "password": "securepassword"
    }
    response = requests.post(url, json=payload)
    assert response.status_code == 201, f"Unexpected status code: {response.status_code}"

def test_login_user():
    # First, register a new user with a unique email.
    unique_email = f"pytest_{uuid.uuid4()}@example.com"
    register_url = f"{BASE_URL}/users/register"
    register_payload = {
        "email": unique_email,
        "password": "securepassword"
    }
    reg_response = requests.post(register_url, json=register_payload)
    assert reg_response.status_code == 201, f"Registration failed: {reg_response.status_code}"
    
    # Then, attempt to log in with the same credentials.
    login_url = f"{BASE_URL}/users/login"
    login_payload = {
        "email": unique_email,
        "password": "securepassword"
    }
    login_response = requests.post(login_url, json=login_payload)
    assert login_response.status_code == 200, f"Login failed: {login_response.status_code}"
