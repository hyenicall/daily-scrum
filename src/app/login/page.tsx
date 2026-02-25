import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "로그인 | 데일리 스크럼",
  description: "데일리 스크럼 서비스에 로그인하세요",
}

export default function LoginPage() {
  return (
    <Container
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10"
      size="sm"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            이메일과 비밀번호로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </Container>
  )
}
