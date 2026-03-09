#!/usr/bin/env python
"""
Cleanup Optional Files Script
Removes test and debug scripts, keeping only essential files
"""

import os
import sys

# Files to delete (test scripts)
TEST_FILES = [
    'test_api.py',
    'test_bulk_upload.py',
    'test_deleted_users.py',
    'test_hard_delete.py',
    'test_login_endpoint.py',
    'test_student_login.py',
]

# Files to delete (debug/one-time scripts)
DEBUG_FILES = [
    'check_emails.py',
    'check_profiles.py',
    'verify_users.py',
    'delete_duplicate_users.py',
    'fix_user_visibility.py',
    'quick_fix.py',
]

# Files to keep (useful utilities)
KEEP_FILES = [
    'quick_setup_departments.py',
    'update_user_departments.py',
    'cleanup_invalid_users.py',
]

# Essential files (never delete)
ESSENTIAL_FILES = [
    'manage.py',
    'requirements.txt',
]

def print_header():
    print("\n" + "="*70)
    print("  PLACEMENT SYSTEM - FILE CLEANUP UTILITY")
    print("="*70)

def check_files():
    """Check which files exist"""
    print("\n📋 Checking files...")
    
    test_exists = [f for f in TEST_FILES if os.path.exists(f)]
    debug_exists = [f for f in DEBUG_FILES if os.path.exists(f)]
    
    return test_exists, debug_exists

def show_summary(test_files, debug_files):
    """Show summary of files"""
    print("\n" + "-"*70)
    print("FILE SUMMARY")
    print("-"*70)
    
    print(f"\n✅ Essential Files (NEVER DELETE):")
    for f in ESSENTIAL_FILES:
        status = "✓" if os.path.exists(f) else "✗"
        print(f"   {status} {f}")
    
    print(f"\n⚠️  Useful Utilities (RECOMMENDED KEEP):")
    for f in KEEP_FILES:
        status = "✓" if os.path.exists(f) else "✗"
        print(f"   {status} {f}")
    
    print(f"\n🧪 Test Scripts (CAN DELETE): {len(test_files)} files")
    for f in test_files:
        print(f"   • {f}")
    
    print(f"\n🔍 Debug Scripts (CAN DELETE): {len(debug_files)} files")
    for f in debug_files:
        print(f"   • {f}")
    
    total_deletable = len(test_files) + len(debug_files)
    print(f"\n📊 Total files that can be deleted: {total_deletable}")

def delete_files(files, category):
    """Delete specified files"""
    deleted = 0
    failed = 0
    
    for filename in files:
        try:
            if os.path.exists(filename):
                os.remove(filename)
                print(f"   ✓ Deleted: {filename}")
                deleted += 1
            else:
                print(f"   ⚠ Not found: {filename}")
        except Exception as e:
            print(f"   ✗ Failed to delete {filename}: {e}")
            failed += 1
    
    return deleted, failed

def main():
    print_header()
    
    # Check files
    test_files, debug_files = check_files()
    
    # Show summary
    show_summary(test_files, debug_files)
    
    if not test_files and not debug_files:
        print("\n✨ No optional files found. Project is already clean!")
        return
    
    # Ask user what to delete
    print("\n" + "-"*70)
    print("CLEANUP OPTIONS")
    print("-"*70)
    print("\n1. Delete test scripts only (6 files)")
    print("2. Delete debug scripts only (6 files)")
    print("3. Delete both test and debug scripts (12 files)")
    print("4. Cancel (keep everything)")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        print("\n🗑️  Deleting test scripts...")
        deleted, failed = delete_files(test_files, "test")
        print(f"\n✅ Deleted {deleted} test script(s)")
        if failed:
            print(f"❌ Failed to delete {failed} file(s)")
    
    elif choice == '2':
        print("\n🗑️  Deleting debug scripts...")
        deleted, failed = delete_files(debug_files, "debug")
        print(f"\n✅ Deleted {deleted} debug script(s)")
        if failed:
            print(f"❌ Failed to delete {failed} file(s)")
    
    elif choice == '3':
        print("\n🗑️  Deleting all optional files...")
        deleted1, failed1 = delete_files(test_files, "test")
        deleted2, failed2 = delete_files(debug_files, "debug")
        total_deleted = deleted1 + deleted2
        total_failed = failed1 + failed2
        print(f"\n✅ Deleted {total_deleted} file(s)")
        if total_failed:
            print(f"❌ Failed to delete {total_failed} file(s)")
    
    elif choice == '4':
        print("\n✋ Cancelled. No files deleted.")
        return
    
    else:
        print("\n❌ Invalid choice. No files deleted.")
        return
    
    # Final summary
    print("\n" + "="*70)
    print("CLEANUP COMPLETE")
    print("="*70)
    print("\n✅ Your project now contains only essential files!")
    print("\nKept files:")
    print("  • manage.py")
    print("  • requirements.txt")
    print("  • api/ folder")
    print("  • backend/ folder")
    print("  • media/ folder")
    print("  • quick_setup_departments.py")
    print("  • update_user_departments.py")
    print("  • cleanup_invalid_users.py")
    print("\n🚀 Your project is clean and ready for production!")
    print("="*70 + "\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✋ Cancelled by user. No files deleted.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
