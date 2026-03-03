import requests
import json

BASE_URL = 'http://localhost:8000/api'

# Test login
print("=== Testing Login ===")
login_data = {
    'username': 'student1',
    'password': 'student123'
}

try:
    response = requests.post(f'{BASE_URL}/login/', json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json()['access']
        print(f"\n✓ Login successful! Token: {token[:50]}...")
        
        # Test dashboard endpoint
        print("\n=== Testing Student Dashboard ===")
        headers = {'Authorization': f'Bearer {token}'}
        dashboard_response = requests.get(f'{BASE_URL}/dashboard/student/', headers=headers)
        print(f"Status Code: {dashboard_response.status_code}")
        print(f"Response: {json.dumps(dashboard_response.json(), indent=2)}")
    else:
        print("✗ Login failed!")
        
except Exception as e:
    print(f"Error: {e}")
