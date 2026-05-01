import { auth } from "@snn/auth/server";

const handler = auth.handler;

export { handler as GET, handler as POST };
