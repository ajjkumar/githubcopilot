import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

# Test root endpoint
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "<title>Mergington High School Activities</title>" in response.text

# Test get activities
def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

# Test signup for activity
def test_signup_for_activity():
    response = client.post("/activities/Chess Club/signup", params={"email": "newstudent@mergington.edu"})
    assert response.status_code == 200
    assert response.json()["message"] == "Signed up newstudent@mergington.edu for Chess Club"

# Test unregister from activity
def test_unregister_from_activity():
    response = client.post("/activities/unregister", json={"activity": "Chess Club", "email": "newstudent@mergington.edu"})
    assert response.status_code == 200
    assert response.json()["message"] == "Unregistered newstudent@mergington.edu from Chess Club"