package expo.modules.unityview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class UnityViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UnityView")

    OnActivityEntersForeground {
      UnityViewRegistry.onResume()
    }

    OnActivityEntersBackground {
      UnityViewRegistry.onPause()
    }

    OnActivityDestroys {
      UnityViewRegistry.onDestroy()
    }

    View(UnityView::class) {
      Name("UnityView")

      Prop("paused", false) { view: UnityView, value: Boolean ->
        view.setPaused(value)
      }

      OnViewDestroys { view: UnityView ->
        view.onHostDestroy()
      }
    }
  }
}
