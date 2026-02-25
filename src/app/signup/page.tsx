import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SignupForm } from "@/components/auth/signup-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "회원가입 | 데일리 스크럼",
  description: "데일리 스크럼 서비스에 가입하세요",
}

export default function SignupPage() {
  return (
    <Container
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10"
      size="sm"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            새 계정을 만들어 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </Container>
  )
}
