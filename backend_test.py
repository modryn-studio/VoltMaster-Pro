import requests
import sys
import json
from datetime import datetime, timedelta

class ElectricianJobAPITester:
    def __init__(self, base_url="https://electri-jobs.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'customers': [],
            'jobs': [],
            'invoices': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test("API Root", "GET", "", 200)
        return success and 'message' in response

    def test_stats_endpoint(self):
        """Test dashboard stats endpoint"""
        success, response = self.run_test("Dashboard Stats", "GET", "stats", 200)
        expected_keys = ['week_revenue', 'active_jobs', 'pending_quotes', 'total_jobs']
        return success and all(key in response for key in expected_keys)

    def test_create_customer(self):
        """Test customer creation"""
        customer_data = {
            "name": f"Test Customer {datetime.now().strftime('%H%M%S')}",
            "phone": "(555) 123-4567",
            "email": "test@example.com",
            "address": "123 Test St, Test City, TS 12345"
        }
        
        success, response = self.run_test("Create Customer", "POST", "customers", 200, customer_data)
        if success and 'id' in response:
            self.created_resources['customers'].append(response['id'])
            return True
        return False

    def test_get_customers(self):
        """Test getting all customers"""
        success, response = self.run_test("Get Customers", "GET", "customers", 200)
        return success and isinstance(response, list)

    def test_get_customer_by_id(self):
        """Test getting customer by ID"""
        if not self.created_resources['customers']:
            print("⚠️  Skipping - No customers created")
            return True
            
        customer_id = self.created_resources['customers'][0]
        success, response = self.run_test("Get Customer by ID", "GET", f"customers/{customer_id}", 200)
        return success and response.get('id') == customer_id

    def test_ai_estimate(self):
        """Test mocked AI estimation"""
        estimate_data = {
            "job_type": "Residential Service",
            "photo_count": 3
        }
        
        success, response = self.run_test("AI Estimate", "POST", "estimate", 200, estimate_data)
        expected_keys = ['materials', 'labor_hours', 'confidence']
        return success and all(key in response for key in expected_keys)

    def test_create_job(self):
        """Test job creation"""
        if not self.created_resources['customers']:
            print("⚠️  Skipping - No customers available")
            return True

        # First get AI estimate for materials
        estimate_data = {"job_type": "Panel Upgrade", "photo_count": 2}
        est_success, est_response = self.run_test("Get Estimate for Job", "POST", "estimate", 200, estimate_data)
        
        if not est_success:
            return False

        customer_id = self.created_resources['customers'][0]
        job_data = {
            "customer_id": customer_id,
            "customer_name": "Test Customer",
            "customer_phone": "(555) 123-4567",
            "customer_address": "123 Test St",
            "job_type": "Panel Upgrade",
            "materials": est_response.get('materials', []),
            "labor_hours": est_response.get('labor_hours', 8),
            "notes": "Test job creation"
        }
        
        success, response = self.run_test("Create Job", "POST", "jobs", 200, job_data)
        if success and 'id' in response:
            self.created_resources['jobs'].append(response['id'])
            return True
        return False

    def test_get_jobs(self):
        """Test getting all jobs"""
        success, response = self.run_test("Get Jobs", "GET", "jobs", 200)
        return success and isinstance(response, list)

    def test_get_jobs_with_filter(self):
        """Test getting jobs with status filter"""
        success, response = self.run_test("Get Jobs (Quoted)", "GET", "jobs", 200, params={"status": "Quoted"})
        return success and isinstance(response, list)

    def test_get_job_by_id(self):
        """Test getting job by ID"""
        if not self.created_resources['jobs']:
            print("⚠️  Skipping - No jobs created")
            return True
            
        job_id = self.created_resources['jobs'][0]
        success, response = self.run_test("Get Job by ID", "GET", f"jobs/{job_id}", 200)
        return success and response.get('id') == job_id

    def test_update_job_status(self):
        """Test updating job status"""
        if not self.created_resources['jobs']:
            print("⚠️  Skipping - No jobs created")
            return True
            
        job_id = self.created_resources['jobs'][0]
        update_data = {"status": "Scheduled"}
        
        success, response = self.run_test("Update Job Status", "PUT", f"jobs/{job_id}", 200, update_data)
        return success and response.get('status') == 'Scheduled'

    def test_generate_pdf(self):
        """Test mocked PDF generation"""
        if not self.created_resources['jobs']:
            print("⚠️  Skipping - No jobs created")
            return True
            
        job_id = self.created_resources['jobs'][0]
        success, response = self.run_test("Generate PDF", "POST", f"jobs/{job_id}/generate-pdf", 200)
        expected_keys = ['message', 'filename', 'job_id', 'mock']
        return success and all(key in response for key in expected_keys)

    def test_create_invoice(self):
        """Test invoice creation"""
        if not self.created_resources['jobs'] or not self.created_resources['customers']:
            print("⚠️  Skipping - No jobs or customers available")
            return True

        job_id = self.created_resources['jobs'][0]
        customer_id = self.created_resources['customers'][0]
        due_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
        
        invoice_data = {
            "job_id": job_id,
            "customer_id": customer_id,
            "customer_name": "Test Customer",
            "amount": 1500.00,
            "due_date": due_date
        }
        
        success, response = self.run_test("Create Invoice", "POST", "invoices", 200, invoice_data)
        if success and 'id' in response:
            self.created_resources['invoices'].append(response['id'])
            return True
        return False

    def test_get_invoices(self):
        """Test getting all invoices"""
        success, response = self.run_test("Get Invoices", "GET", "invoices", 200)
        return success and isinstance(response, list)

    def test_update_invoice_status(self):
        """Test updating invoice status"""
        if not self.created_resources['invoices']:
            print("⚠️  Skipping - No invoices created")
            return True
            
        invoice_id = self.created_resources['invoices'][0]
        update_data = {
            "status": "Paid",
            "paid_date": datetime.now().strftime('%Y-%m-%d')
        }
        
        success, response = self.run_test("Update Invoice Status", "PUT", f"invoices/{invoice_id}", 200, update_data)
        return success and response.get('status') == 'Paid'

    def test_delete_customer(self):
        """Test customer deletion"""
        if not self.created_resources['customers']:
            print("⚠️  Skipping - No customers to delete")
            return True
            
        customer_id = self.created_resources['customers'][-1]  # Delete last created
        success, response = self.run_test("Delete Customer", "DELETE", f"customers/{customer_id}", 200)
        if success:
            self.created_resources['customers'].remove(customer_id)
        return success

    def test_delete_job(self):
        """Test job deletion"""
        if not self.created_resources['jobs']:
            print("⚠️  Skipping - No jobs to delete")
            return True
            
        job_id = self.created_resources['jobs'][-1]  # Delete last created
        success, response = self.run_test("Delete Job", "DELETE", f"jobs/{job_id}", 200)
        if success:
            self.created_resources['jobs'].remove(job_id)
        return success

def main():
    print("🔧 Starting VoltMaster Pro API Tests...")
    print("=" * 50)
    
    tester = ElectricianJobAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_stats_endpoint,
        tester.test_create_customer,
        tester.test_get_customers,
        tester.test_get_customer_by_id,
        tester.test_ai_estimate,
        tester.test_create_job,
        tester.test_get_jobs,
        tester.test_get_jobs_with_filter,
        tester.test_get_job_by_id,
        tester.test_update_job_status,
        tester.test_generate_pdf,
        tester.test_create_invoice,
        tester.test_get_invoices,
        tester.test_update_invoice_status,
        tester.test_delete_customer,
        tester.test_delete_job,
    ]
    
    failed_tests = []
    
    for test in tests:
        try:
            if not test():
                failed_tests.append(test.__name__)
        except Exception as e:
            print(f"❌ {test.__name__} crashed: {str(e)}")
            failed_tests.append(test.__name__)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
    
    if failed_tests:
        print(f"❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())