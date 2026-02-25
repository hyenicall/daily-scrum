import { Users, Crown, User } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import type { TeamMember } from "@/types"

interface AdminMemberListProps {
  members: TeamMember[]
}

// 팀원 목록 테이블 — Server Component
export function AdminMemberList({ members }: AdminMemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="팀원이 없습니다"
        description="API를 통해 팀원을 초대하세요"
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>가입일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.userId}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {member.role === "admin" ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  {member.profile?.displayName ?? "이름 없음"}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.profile?.email ?? "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={member.role === "admin" ? "default" : "secondary"}
                >
                  {member.role === "admin" ? "관리자" : "팀원"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {member.profile?.createdAt
                  ? member.profile.createdAt.toLocaleDateString("ko-KR")
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
