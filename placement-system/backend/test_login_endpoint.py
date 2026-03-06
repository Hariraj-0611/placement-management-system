"""
Test the login endpoint to debug JSON parse error
"""
import requests
import json

BASE_URL = 'http://localhost:8000'

def test_login():
    print("\n" + "="*80)
    print("TESTING LOGIN ENDPOINT")
    print("="*80)
    
    # Test data
    login_data = {
        'username': 'test@example.com',
        'password': 'testpassword'
    }
    
    print(f"\n1. Testing POST {BASE_URL}/api/login/")
    print(f"   Data: {login_data}")
    
    try:
        response = requests.post(
            f'{BASE_URL}/api/login/',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n2. Response Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        print(f"\n3. Response Content Type: {response.headers.get('Content-Type')}")
        
        print(f"\n4. Raw Response Text (first 500 chars):")
        print(response.text[:500])
        
        # Try to parse as JSON
        try:
            json_response = response.json()
            print(f"\n5. ✓ JSON Response:")
            print(json.dumps(json_response, indent=2))
        except json.JSONDecodeError as e:
            print(f"\n5. ✗ JSON Parse Error: {e}")
            print(f"   This means the server returned HTML instead of JSON")
            print(f"\n   Full Response:")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Cannot connect to backend server")
        print("   Make sure Django server is running:")
        print("   python manage.py runserver")
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
    
    print("\n" + "="*80)

if __name__ == '__main__':
    test_login()
