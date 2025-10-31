package expo.modules.unityview

import java.util.Collections
import java.util.WeakHashMap

internal object UnityViewRegistry {
  private val registeredViews = Collections.newSetFromMap(WeakHashMap<UnityView, Boolean>())

  fun register(view: UnityView) {
    registeredViews.add(view)
  }

  fun unregister(view: UnityView) {
    registeredViews.remove(view)
  }

  fun onResume() {
    registeredViews.forEach { it.onHostResume() }
  }

  fun onPause() {
    registeredViews.forEach { it.onHostPause() }
  }

  fun onDestroy() {
    val snapshot = registeredViews.toList()
    registeredViews.clear()
    snapshot.forEach { it.onHostDestroy() }
  }
}
