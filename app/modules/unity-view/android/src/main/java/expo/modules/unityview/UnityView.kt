package expo.modules.unityview

import android.app.Activity
import android.content.Context
import android.view.View
import com.unity3d.player.IUnityPlayerLifecycleEvents
import com.unity3d.player.UnityPlayer
import com.unity3d.player.UnityPlayerForActivityOrService
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class UnityView(context: Context, private val appContext: AppContext) :
  ExpoView(context, appContext), IUnityPlayerLifecycleEvents {
  private val unityPlayer: UnityPlayerForActivityOrService
  private val unityView: View
  private var pausedByProp: Boolean = false
  private var isDestroyed = false

  init {
    val activity = resolveActivity()
    UnityPlayer.currentActivity = activity
    UnityPlayer.currentContext = context

    unityPlayer = UnityPlayerForActivityOrService(activity, this)
    unityView = unityPlayer.view
    unityView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)

    addView(unityView)
    UnityViewRegistry.register(this)
  }

  private fun resolveActivity(): Activity {
    val fromProvider = appContext.currentActivity
    if (fromProvider != null) {
      return fromProvider
    }

    val fromContext = context
    if (fromContext is Activity) {
      return fromContext
    }

    throw IllegalStateException("UnityView requires an Activity context")
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    UnityPlayer.currentActivity = appContext.currentActivity ?: UnityPlayer.currentActivity
    UnityPlayer.currentContext = context
    if (!pausedByProp && !isDestroyed) {
      unityPlayer.resume()
      unityPlayer.windowFocusChanged(true)
    }
  }

  override fun onDetachedFromWindow() {
    if (!pausedByProp && !isDestroyed) {
      unityPlayer.windowFocusChanged(false)
      unityPlayer.pause()
    }
    super.onDetachedFromWindow()
  }

  fun setPaused(paused: Boolean) {
    if (pausedByProp == paused) {
      return
    }
    pausedByProp = paused
    if (paused) {
      onHostPause()
    } else {
      onHostResume()
    }
  }

  fun onHostResume() {
    if (isDestroyed || pausedByProp) {
      return
    }
    unityPlayer.resume()
    unityPlayer.windowFocusChanged(true)
  }

  fun onHostPause() {
    if (isDestroyed) {
      return
    }
    unityPlayer.windowFocusChanged(false)
    unityPlayer.pause()
  }

  fun onHostDestroy() {
    if (isDestroyed) {
      return
    }
    unityPlayer.destroy()
    removeView(unityView)
    isDestroyed = true
    UnityViewRegistry.unregister(this)
  }

  override fun onUnityPlayerUnloaded() = Unit

  override fun onUnityPlayerQuitted() = Unit
}
