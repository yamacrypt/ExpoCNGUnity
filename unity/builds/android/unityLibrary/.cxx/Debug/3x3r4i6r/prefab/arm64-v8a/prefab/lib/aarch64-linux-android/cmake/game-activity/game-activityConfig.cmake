if(NOT TARGET game-activity::game-activity)
add_library(game-activity::game-activity STATIC IMPORTED)
set_target_properties(game-activity::game-activity PROPERTIES
    IMPORTED_LOCATION "/root/.gradle/caches/8.14.3/transforms/a64dd3ad31f3266d83a6e28098c1a373/transformed/games-activity-3.0.5/prefab/modules/game-activity/libs/android.arm64-v8a/libgame-activity.a"
    INTERFACE_INCLUDE_DIRECTORIES "/root/.gradle/caches/8.14.3/transforms/a64dd3ad31f3266d83a6e28098c1a373/transformed/games-activity-3.0.5/prefab/modules/game-activity/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET game-activity::game-activity_static)
add_library(game-activity::game-activity_static STATIC IMPORTED)
set_target_properties(game-activity::game-activity_static PROPERTIES
    IMPORTED_LOCATION "/root/.gradle/caches/8.14.3/transforms/a64dd3ad31f3266d83a6e28098c1a373/transformed/games-activity-3.0.5/prefab/modules/game-activity_static/libs/android.arm64-v8a/libgame-activity_static.a"
    INTERFACE_INCLUDE_DIRECTORIES "/root/.gradle/caches/8.14.3/transforms/a64dd3ad31f3266d83a6e28098c1a373/transformed/games-activity-3.0.5/prefab/modules/game-activity_static/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

