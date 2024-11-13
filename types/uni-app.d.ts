import type { ChatKIT } from "../ChatUIKIT"


declare global {
	interface Uni {
		$UIKIT : ChatKIT
	}
}