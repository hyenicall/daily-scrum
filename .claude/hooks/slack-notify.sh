#!/usr/bin/env bash
# Claude Code 이벤트 → Slack 알림 스크립트
# 환경변수 SLACK_WEBHOOK_URL 필요 (프로젝트 루트 .env에서 로드)

readonly LOG_FILE="${HOME}/.claude/hooks/slack-notify.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$1] ${*:2}" >> "${LOG_FILE}"
}

send_slack() {
  local webhook_url="$1" payload="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -X POST -H "Content-Type: application/json" \
    -d "${payload}" "${webhook_url}" 2>/dev/null || echo "000")
  if [[ "${code}" == "200" ]]; then
    log "INFO" "Slack 전송 성공"
  else
    log "ERROR" "전송 실패 (HTTP ${code})"
  fi
}

main() {
  local input
  input=$(cat)

  local event cwd session_id project
  event=$(echo "${input}" | jq -r '.hook_event_name // "unknown"')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')
  session_id=$(echo "${input}" | jq -r '.session_id // ""')
  project=$(basename "${cwd}")

  log "INFO" "이벤트: ${event}, 프로젝트: ${project}"

  # 프로젝트 .env에서 SLACK_WEBHOOK_URL 로드 (이미 설정된 경우 덮어쓰지 않음)
  if [[ -f "${cwd}/.env" && -z "${SLACK_WEBHOOK_URL:-}" ]]; then
    local env_val
    env_val=$(grep -E '^SLACK_WEBHOOK_URL=' "${cwd}/.env" | head -1 | cut -d'=' -f2- | tr -d '"'"'")
    [[ -n "${env_val}" ]] && SLACK_WEBHOOK_URL="${env_val}"
  fi

  if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
    log "ERROR" "SLACK_WEBHOOK_URL 미설정 (.env 또는 환경변수 확인 필요)"
    exit 0  # 훅 실패가 Claude Code를 중단시키지 않도록
  fi

  case "${event}" in
    "notification")
      local notif_type msg
      notif_type=$(echo "${input}" | jq -r '.notification_type // ""')
      [[ "${notif_type}" != "permission_prompt" ]] && exit 0

      msg=$(jq -r '.message')

      local payload
      payload=$(jq -n \
        --arg p "${project}" \
        --arg m "${msg}" \
        --arg s "${session_id:0:8}" \
        --arg d "${cwd}" \
        '{
          "blocks": [
            {
              "type": "header",
              "text": {"type": "plain_text", "text": "🔔 Claude Code 권한 요청", "emoji": true}
            },
            {
              "type": "section",
              "fields": [
                {"type": "mrkdwn", "text": "*프로젝트*\n`\($p)`"},
                {"type": "mrkdwn", "text": "*세션*\n`\($s)...`"}
              ]
            },
            {
              "type": "section",
              "text": {"type": "mrkdwn", "text": "*요청 내용*\n\($m)"}
            },
            {
              "type": "context",
              "elements": [{"type": "mrkdwn", "text": "📁 \($d)"}]
            }
          ],
          "text": "[\($p)] 권한 요청: \($m)"
        }')

      send_slack "${SLACK_WEBHOOK_URL}" "${payload}"
      ;;

    "stop")
      # stop_hook_active: true 이면 Stop 훅 실행 중 발생한 재진입 → 무한루프 방지
      local stop_active
      stop_active=$(echo "${input}" | jq -r '.stop_hook_active // false')
      [[ "${stop_active}" == "true" ]] && exit 0

      local last_msg
      last_msg=$(echo "${input}" | jq -r '.last_assistant_message // ""' | head -c 200)

      local payload
      payload=$(jq -n \
        --arg p "${project}" \
        --arg m "${last_msg}" \
        --arg s "${session_id:0:8}" \
        --arg d "${cwd}" \
        '{
          "blocks": [
            {
              "type": "header",
              "text": {"type": "plain_text", "text": "✅ Claude Code 작업 완료", "emoji": true}
            },
            {
              "type": "section",
              "fields": [
                {"type": "mrkdwn", "text": "*프로젝트*\n`\($p)`"},
                {"type": "mrkdwn", "text": "*세션*\n`\($s)...`"}
              ]
            },
            {
              "type": "section",
              "text": {"type": "mrkdwn", "text": "*응답 요약*\n\($m)"}
            },
            {
              "type": "context",
              "elements": [{"type": "mrkdwn", "text": "📁 \($d) | 입력 대기 중"}]
            }
          ],
          "text": "[\($p)] 작업 완료 - 입력 대기 중"
        }')

      send_slack "${SLACK_WEBHOOK_URL}" "${payload}"
      ;;

    *)
      log "WARN" "처리하지 않는 이벤트: ${event}"
      ;;
  esac
}

main "$@"
