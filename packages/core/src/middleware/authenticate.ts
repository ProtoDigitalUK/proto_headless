import { FastifyRequest } from "fastify";
// Utils
import { HeadlessError } from "@utils/app/error-handler.js";
// Services
import authService from "@services/auth/index.js";

const authenticate = async (request: FastifyRequest) => {
  const authenticateJWT = authService.jwt.verifyJWT(request);
  if (!authenticateJWT.success || !authenticateJWT.data) {
    throw new HeadlessError({
      type: "authorisation",
      message: "You are not authorised to perform this action",
    });
  }

  request.auth = authenticateJWT.data;
};

export default authenticate;
