import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

# Copy original activities for reset
original_activities = activities.copy()


@pytest.fixture
def client():
    # Reset activities to original state before each test
    activities.clear()
    activities.update(original_activities)
    return TestClient(app)


def test_get_activities(client):
    # Arrange: Activities are set up in fixture

    # Act: GET /activities
    response = client.get("/activities")

    # Assert: Status 200, correct structure
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]


def test_signup_success(client):
    # Arrange: Valid email and activity
    email = "newstudent@mergington.edu"
    activity = "Chess Club"

    # Act: POST signup
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert: Status 200, message correct, participant added
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert email in data["message"]
    assert email in activities[activity]["participants"]


def test_signup_duplicate(client):
    # Arrange: Email already signed up
    email = "michael@mergington.edu"  # Already in Chess Club
    activity = "Chess Club"

    # Act: POST duplicate signup
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert: Status 400, error message
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "already signed up" in data["detail"]


def test_signup_invalid_activity(client):
    # Arrange: Non-existent activity
    email = "test@mergington.edu"
    activity = "NonExistent"

    # Act: POST signup
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert: Status 404, error message
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Activity not found" in data["detail"]


def test_signup_malformed_email(client):
    # Arrange: Email without @
    email = "invalidemail"
    activity = "Chess Club"

    # Act: POST signup
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert: Status 400, invalid email
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid email format" in data["detail"]


def test_signup_invalid_email_structure(client):
    # Arrange: Email like "user@"
    email = "user@"
    activity = "Chess Club"

    # Act: POST signup
    response = client.post(f"/activities/{activity}/signup?email={email}")

    # Assert: Status 400, invalid email
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid email format" in data["detail"]


def test_remove_participant_success(client):
    # Arrange: Participant exists
    email = "michael@mergington.edu"
    activity = "Chess Club"
    assert email in activities[activity]["participants"]

    # Act: DELETE participant
    response = client.delete(f"/activities/{activity}/participants?email={email}")

    # Assert: Status 200, message correct, participant removed
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert email in data["message"]
    assert email not in activities[activity]["participants"]


def test_remove_participant_not_found(client):
    # Arrange: Participant does not exist
    email = "nonexistent@mergington.edu"
    activity = "Chess Club"

    # Act: DELETE participant
    response = client.delete(f"/activities/{activity}/participants?email={email}")

    # Assert: Status 404, error message
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Participant not found" in data["detail"]


def test_remove_invalid_activity(client):
    # Arrange: Invalid activity
    email = "test@mergington.edu"
    activity = "Invalid"

    # Act: DELETE participant
    response = client.delete(f"/activities/{activity}/participants?email={email}")

    # Assert: Status 404, error message
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Activity not found" in data["detail"]


def test_get_activities_empty(client):
    # Arrange: Clear activities
    activities.clear()

    # Act: GET /activities
    response = client.get("/activities")

    # Assert: Status 200, empty dict
    assert response.status_code == 200
    data = response.json()
    assert data == {}