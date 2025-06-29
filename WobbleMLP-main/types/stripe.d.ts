declare global {
  interface Window {
    Stripe: {
      redirectToCheckout: (options: {
        sessionId: string;
      }) => Promise<{ sessionId: string }>;
    };
  }
}

export {};
