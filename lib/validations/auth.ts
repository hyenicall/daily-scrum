import { z } from "zod/v4"

export const loginSchema = z.object({
  email: z
    .email("올바른 이메일 주소를 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "이름은 최소 2자 이상이어야 합니다.")
      .max(50, "이름은 50자를 초과할 수 없습니다."),
    email: z
      .email("올바른 이메일 주소를 입력해주세요."),
    password: z
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        "비밀번호는 영문자와 숫자를 포함해야 합니다.",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
