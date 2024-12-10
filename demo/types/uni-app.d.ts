import type { ChatKIT } from "../ChatUIKit"

declare global {
	interface Uni {
		$UIKIT : ChatKIT
	}
}