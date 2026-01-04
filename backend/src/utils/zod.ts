import * as z from "zod";

const signupValidation = z.object({
    name: z.string()
      .min(3, { message: "Your name must have more than 3 letters" })
      .max(20, { message: "Your name must have less than 20 letters" }),
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(64, { message: "Password must be at most 64 characters" })
});

const loginValidation = z.object({
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(64, { message: "Password must be at most 64 characters" })
});

const createRoomValidation = z.object({
  title: z.string().min(3, {error: "Title must have atleast 3 words"}).max(20, {error: "Title must have less than 20 words"}),
  max: z.number().min(2, {error: "Maximum value must be greater than or equal to 2"})
})

const joinRoomValidation = z.object({
  roomCode: z.string().min(6,{error: "Room code must be greater than 6 characters"})
})

export type SignupType = z.infer<typeof signupValidation>;
export type LoginType = z.infer<typeof loginValidation>;
export type CreateRoomType = z.infer<typeof createRoomValidation>;
export type JoinRoomType = z.infer<typeof joinRoomValidation>;

export { signupValidation, loginValidation, createRoomValidation, joinRoomValidation };