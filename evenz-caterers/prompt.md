See i have already saved the booking request in my database, and this booking requests are made by a certain client for certain caterers . Now i want to fetch these requests for client and caterer both.
1. For client :- all the booking requests made by a certain client for different caterers(or same caterer) should be present on the MyBooking page of the client with all the details the client has filled in the form. And there should be a status symbol showing for the request , status should be pending untill the caterer has seen the request, and then status should be updated as seen and it would remain as seen untill the caterer has marked confirmed and then status will become confirmed. Client is already logged in. This is the middleware for the client.

2. For caterer :- All the booking requests made by different clients(or same client with multiple booking request) for a specific caterer should be present on this page, and the contact details of all the clients should be blurred( this is the part of revenue model for my app). All the data related to booking request should be shown to the caterer on his Bookings.js page expect for the contact details(client name and contact no.) of the client. And each request will remain locked until the caterer pays the unlocking fee for a certain booking request to the admin, once the caterer paid the unlocking fee for a certain booking request then he can see the contact details of the client for that request. When the caterer unlocks a request then the status for the client should be updated as seen. note that my caterer is already logged in.  This is middleware auth for vendor/caterer

3.I have already built the full stack app for booking management for client and caterer, Now i'm proceeding to admin portal. I have already built the backend for my admin(Evenz.in admin) portal, your job is to build the front-end and apply api calls of admin portal which have the power to unlock the booking request , when the caterer will click on the unlock button for a certain booking request then a notification will be sent to the admin on his portal with the booking request id which caterer wants to unlock. Admin will have access to all the booking requests which are ongoing on the app. When the admin recieves notification or caterer may manually call the admin to unlock a certain booking request, then admin will unlock the request (in between admin will ask the caterer to pay the unlocking fee manually through upi or bank transfer but this is not the part of the app's code). Also build a basic register and login page for admin. Once the booking request is unlocked then this request will be moved to unlocked requests tab where caterer will get the option to make it confirmed or not confirmed with an additional notes input and then save it. And all the locked requests will be present on the ongoing requests tab of the booking page for the caterer. And once the caterer marked it confirmed also update the status for the client as confirmed.

Note :- admin page must be secure and there should be no chances of security lapses or loss of data.
I am providing all the necessary files to create my admin front-end(react+tailwind, mobile-first, responsive, clean ui)

Now your job is to build the full stack MERN app booking page for both clients and caterers, and for my admin portal. Front-ui should be clean, simple, intuitive and mobile first and responsive in react+tailwind. I am providing certain backend files which will help you to build this.
// server/models/BookingRequest.js
const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  clientPhone: {
    type: String,
    required: true
  },
  catererId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  catererName: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Wedding', 'Birthday Party', 'Corporate Event', 'Pooja/Religious', 'Baby Shower', 'Housewarming', 'Small Get-Together', 'Other']
  },
  eventDate: {
    type: Date,
    required: true
  },
  numGuests: {
    type: Number,
    required: true,
    min: 1
  },
  eventLocation: {
    type: String,
    required: true
  },
  venueType: {
    type: String,
    enum: ['Banquet Hall', 'Home', 'Office', 'Open Ground', 'Rooftop', 'Other']
  },
  mealPreference: {
    type: [String],
    required: true,
    enum: ['Vegetarian Only', 'Non-Vegetarian', 'Mixed', 'Jain']
  },
  selectedCuisine: {
    type: String,
    required: true
  },
  selectedPackage: {
    name: { type: String, required: true },
    pricePerPlate: { type: Number, required: true },
    inclusions: {
      numStarters: Number,
      numMains: Number,
      numBeverages: Number,
      numBreads: Number,
      numDesserts: Number,
      other: String
    }
  },
  selectedLiveCounters: [{
    name: String,
    costType: { type: String, enum: ['per_person'] },
    cost: Number
  }],
  specialRequests: String,
  estimatedCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'unlocked', 'confirmed', 'rejected'],
    default: 'pending'
  },
  unlockedByAdminAt: Date,
  unlockedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);

app.use('/api/booking',bookingRoutes),