import type { ChatUIKIT } from "../ChatUIKIT"


declare global {
	interface Uni {
		$UIKIT : ChatUIKIT
	}
}