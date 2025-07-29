// 2. Location Service (services/locationService.js)
const axios = require('axios');

class LocationService {
  constructor() {
    // Using free India Post API for states and cities
    this.baseUrl = 'https://api.postalpincode.in';
  }

  async getStates() {
    try {
      // Static list of Indian states and union territories
      const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
      ];

      return {
        success: true,
        data: states.map(state => ({
          name: state,
          code: state.toLowerCase().replace(/\s+/g, '_')
        }))
      };
    } catch (error) {
      console.error('Error fetching states:', error);
      return {
        success: false,
        error: 'Failed to fetch states'
      };
    }
  }

  async getCitiesByState(stateName) {
    try {
      const citiesByState = {
        'andhra_pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Eluru'],
        'arunachal_pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro'],
        'assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tezpur', 'Tinsukia', 'Karimganj', 'Sivasagar', 'Goalpara'],
        'bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Purnia', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Bagaha', 'Buxar', 'Kishanganj'],
        'chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur', 'Ambikapur'],
        'goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
        'gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Nadiad', 'Navsari'],
        'haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sirsa', 'Sonipat'],
        'himachal_pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi', 'Bilaspur', 'Una', 'Hamirpur'],
        'jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih'],
        'karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga'],
        'kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Alappuzha', 'Kollam', 'Kannur', 'Palakkad', 'Kottayam'],
        'madhya_pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Satna', 'Ratlam', 'Rewa'],
        'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna'],
        'manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur'],
        'meghalaya': ['Shillong', 'Tura', 'Nongpoh', 'Jowai'],
        'mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'],
        'nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'],
        'odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur', 'Berhampur', 'Balasore', 'Puri'],
        'punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur', 'Mohali', 'Firozpur'],
        'rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar'],
        'sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan'],
        'tamil_nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi', 'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam'],
        'telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam'],
        'tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'],
        'uttar_pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad'],
        'uttarakhand': ['Dehradun', 'Haridwar', 'Haldwani', 'Roorkee', 'Rudrapur', 'Nainital'],
        'west_bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Malda', 'Bardhaman', 'Barasat', 'Raiganj', 'Kharagpur', 'Haldia', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bangaon', 'Purulia', 'Ranaghat'],
        'andaman_and_nicobar_islands': ['Port Blair'],
        'chandigarh': ['Chandigarh'],
        'dadra_and_nagar_haveli_and_daman_and_diu': ['Daman', 'Diu', 'Silvassa'],
        'delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara'],
        'jammu_and_kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'],
        'ladakh': ['Leh', 'Kargil'],
        'lakshadweep': ['Kavaratti'],
        'puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
      };

      const normalizedState = stateName.toLowerCase().replace(/\s+/g, '_');
      const cities = citiesByState[normalizedState] || [];

      return {
        success: true,
        data: cities.map(city => ({
          name: city,
          code: city.toLowerCase().replace(/\s+/g, '_')
        }))
      };
    } catch (error) {
      console.error('Error fetching cities:', error);
      return {
        success: false,
        error: 'Failed to fetch cities'
      };
    }
  }
}

module.exports = new LocationService();
