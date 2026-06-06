declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface RazorpayOrderCreateRequestBody {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: {
      create(options: RazorpayOrderCreateRequestBody): Promise<{ id: string; amount: number; currency: string }>;
    };
  }

  export default Razorpay;
}
