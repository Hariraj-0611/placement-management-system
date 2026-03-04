"""
Test script to debug bulk upload issues
Run this to test your Excel file locally
"""
import pandas as pd
from datetime import datetime

def test_excel_file(file_path):
    """Test reading and parsing Excel file"""
    print(f"\n{'='*60}")
    print(f"Testing Excel file: {file_path}")
    print(f"{'='*60}\n")
    
    try:
        # Read Excel file
        df = pd.read_excel(file_path)
        
        print(f"✓ File read successfully")
        print(f"  Total rows: {len(df)}")
        print(f"  Columns: {df.columns.tolist()}\n")
        
        # Show first few rows
        print("First few rows:")
        print(df.head())
        print()
        
        # Normalize column names
        df.columns = df.columns.str.strip().str.lower()
        print(f"Normalized columns: {df.columns.tolist()}\n")
        
        # Check for required columns
        if 'email' not in df.columns:
            print("❌ ERROR: 'email' column not found!")
            return
        
        print("✓ Required 'email' column found\n")
        
        # Process each row
        print(f"{'='*60}")
        print("Processing rows:")
        print(f"{'='*60}\n")
        
        for index, row in df.iterrows():
            print(f"\n--- Row {index + 2} ---")
            
            # Email
            email = str(row.get('email', '')).strip()
            print(f"  Email: {email}")
            
            if not email or pd.isna(email):
                print(f"  ❌ ERROR: Email is empty or invalid")
                continue
            
            # Name
            if 'name' in df.columns:
                full_name = str(row.get('name', '')).strip()
                name_parts = full_name.split(' ', 1)
                first_name = name_parts[0] if name_parts else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
            else:
                first_name = str(row.get('first name', row.get('firstname', ''))).strip()
                last_name = str(row.get('last name', row.get('lastname', ''))).strip()
            
            print(f"  Name: {first_name} {last_name}")
            
            # Department
            department = str(row.get('department', '')).strip()
            print(f"  Department: {department}")
            
            # CGPA
            cgpa = row.get('cgpa', None)
            if cgpa and not pd.isna(cgpa):
                try:
                    cgpa = float(cgpa)
                    print(f"  CGPA: {cgpa}")
                except:
                    print(f"  CGPA: Invalid ({cgpa})")
            else:
                print(f"  CGPA: Not provided")
            
            # Date of Birth
            date_of_birth = row.get('date of birth', row.get('dob', row.get('dateofbirth', None)))
            print(f"  Date of Birth (raw): {date_of_birth} (type: {type(date_of_birth).__name__})")
            
            password = None
            dob_str = None
            
            if date_of_birth and not pd.isna(date_of_birth):
                # Try to parse date
                if isinstance(date_of_birth, str):
                    print(f"  Trying to parse string date...")
                    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%m/%d/%Y']:
                        try:
                            dob = datetime.strptime(date_of_birth.strip(), fmt)
                            password = dob.strftime('%d%m%Y')
                            dob_str = dob.strftime('%Y-%m-%d')
                            print(f"  ✓ Parsed with format {fmt}")
                            break
                        except ValueError:
                            continue
                elif hasattr(date_of_birth, 'strftime'):
                    print(f"  Date is already datetime object")
                    password = date_of_birth.strftime('%d%m%Y')
                    dob_str = date_of_birth.strftime('%Y-%m-%d')
                
                # Try pandas to_datetime as last resort
                if not password:
                    print(f"  Trying pandas to_datetime...")
                    try:
                        dob = pd.to_datetime(date_of_birth, errors='coerce')
                        if not pd.isna(dob):
                            password = dob.strftime('%d%m%Y')
                            dob_str = dob.strftime('%Y-%m-%d')
                            print(f"  ✓ Parsed with pandas")
                    except Exception as e:
                        print(f"  ❌ pandas parsing failed: {e}")
            
            if password:
                print(f"  ✓ Password generated: {password}")
                print(f"  ✓ DOB formatted: {dob_str}")
            else:
                print(f"  ⚠ No DOB - will generate random password")
            
            # Username
            username = email.split('@')[0]
            print(f"  Username: {username}")
            
            print(f"  ✓ Row {index + 2} processed successfully")
        
        print(f"\n{'='*60}")
        print("✓ All rows processed")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python test_bulk_upload.py <path_to_excel_file>")
        print("\nExample:")
        print("  python test_bulk_upload.py students.xlsx")
        sys.exit(1)
    
    file_path = sys.argv[1]
    test_excel_file(file_path)
