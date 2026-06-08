# Keycloak Redirect URI Candidates

This document fixes the redirect/callback URL candidates to send to the AlphaCampus/LMS Keycloak operations team.

## Assumptions

- Keycloak realm: `kird`
- Keycloak version: `v26.0.4` on JDK 17
- Client id request value: `kird-ps-track-dashboard`
- Client type: `confidential`
- JWT verification is handled by the AlphaCampus/LMS gateway.
- PS Track receives verified identity through trusted headers.
- PS Track does not currently run a direct OIDC authorization-code callback.

## Host Placeholder

The public host is not fixed in this repository yet.

Use this placeholder until the infrastructure team confirms the production DNS:

```text
https://[PS_TRACK_PUBLIC_HOST]
```

Recommended production DNS candidate:

```text
https://ps-track.alpha-campus.kr
```

If AlphaCampus requires a service path under an existing host instead of a subdomain, use the same path consistently for every URL below.

## URLs To Register / Request

### 1. Login Success Redirect URL

Use this as the primary post-login landing URL when the AlphaCampus/LMS gateway completes Keycloak authentication and forwards the verified request to PS Track.

```text
https://[PS_TRACK_PUBLIC_HOST]/dashboard
```

Recommended production candidate:

```text
https://ps-track.alpha-campus.kr/dashboard
```

Rationale:

- `/dashboard` is the current role-aware first screen.
- `/` already redirects to `/dashboard`.
- The app expects the gateway to inject trusted identity headers before the request reaches PS Track.

### 2. Post Logout Redirect URI

Use this as `post_logout_redirect_uri` after Keycloak logout.

```text
https://[PS_TRACK_PUBLIC_HOST]/login
```

Recommended production candidate:

```text
https://ps-track.alpha-campus.kr/login
```

Rationale:

- `/login` exists today and can serve as the logout landing/re-entry screen.
- The current page is a mock role selector, so before production it should be replaced or adjusted to a real SSO re-entry page.

### 3. Health / Smoke URL

This is not a Keycloak redirect URI. It is a deployment smoke-test URL to verify the PS Track service is alive.

```text
https://[PS_TRACK_PUBLIC_HOST]/api/health
```

Recommended production candidate:

```text
https://ps-track.alpha-campus.kr/api/health
```

## Future Direct OIDC Callback Candidate

Only use this if PS Track later performs the OIDC authorization-code flow directly instead of relying on the AlphaCampus/LMS gateway.

```text
https://[PS_TRACK_PUBLIC_HOST]/auth/callback/keycloak
```

Recommended production candidate:

```text
https://ps-track.alpha-campus.kr/auth/callback/keycloak
```

Current status:

- Not implemented.
- Not required for the current gateway-verified trusted-header architecture.
- Should not be registered as the main redirect URI unless the architecture changes.

## Keycloak Logout URL Shape

AlphaCampus production realm logout endpoint:

```text
https://alpha-campus.kr/auth/realms/kird/protocol/openid-connect/logout?id_token_hint=[id_token]&post_logout_redirect_uri=https%3A%2F%2F%5BPS_TRACK_PUBLIC_HOST%5D%2Flogin
```

Recommended production candidate:

```text
https://alpha-campus.kr/auth/realms/kird/protocol/openid-connect/logout?id_token_hint=[id_token]&post_logout_redirect_uri=https%3A%2F%2Fps-track.alpha-campus.kr%2Flogin
```

## Request To Operations Team

Send this minimal request once the final public host is confirmed:

```text
Client ID: kird-ps-track-dashboard
Client type: confidential
Realm: kird

Login success redirect URL:
https://[PS_TRACK_PUBLIC_HOST]/dashboard

Post logout redirect URI:
https://[PS_TRACK_PUBLIC_HOST]/login

Smoke-test URL:
https://[PS_TRACK_PUBLIC_HOST]/api/health

Claims required:
- uuid
- email
- username/login_id

Role claim:
- Not required for MVP authorization
- Optional later; PS Track maintains internal role_assignments

Token verification:
- AlphaCampus/LMS gateway verifies JWT
- PS Track receives trusted identity headers
```

