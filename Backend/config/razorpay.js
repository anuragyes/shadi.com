// import Razorpay from "razorpay";

// import dotenv from "dotenv";
// const razorpay = new Razorpay({
//     key_id: process.env.razorpay_key_id,
//     // console.log("keyid-------------",key_id);
//     key_secret: "dfdgSn2s5rb6Oe6Vid45UoGK"
// });


//     console.log("keyid-------------",process.env.razorpay_key_id );



// export default razorpay;


// import Razorpay from "razorpay";
// import dotenv from "dotenv";

// dotenv.config(); // ✅ MUST be at the top

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// console.log("keyid-------------", process.env.RAZORPAY_KEY_ID);

// export default razorpay;

import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "LOADED" : "MISSING");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
