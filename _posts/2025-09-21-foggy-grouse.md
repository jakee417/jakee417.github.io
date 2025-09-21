---
title: Foggy Grouse Mod
author: jake
date: 2025-09-21 12:00:00 +0800
categories: [Software Engineering]
tags: [stardew valley, mods, grouse]
math: false
mermaid: false
image:
  path: /assets/img/custom/grouse.png
  alt: Foggy Grouse Sprites
---

Check out my [Foggy Grouse](https://www.nexusmods.com/stardewvalley/mods/37714) mod for Stardew Valley!

![chasing grouse](/assets/img/custom/grouse_demo_2_long.gif)

The mod is written in C# and open source ([source code](https://github.com/jakee417/Fog-Mod)). It was inspired by the grouse & fog from the PNW 🌲.

## Implementation Details
This is my first [SMAPI](https://smapi.io/) mod and I found the process pretty easy overall (the [documentation](https://stardewvalleywiki.com/Modding:Index) is great). The most challenging aspect was keeping things in sync during multiplayer. Initially I was using [messaging](https://stardewvalleywiki.com/Modding:Modder_Guide/APIs/Multiplayer#Send_messages) for everything, but the code got way too complex for the `Grouse` class. Migrating to `INetObject<NetFields>` dramatically simplified this and now it works as good as the game's built-in monsters! I still use the messaging for sending simple 'signals' to other farmhands like when explosion smoke should be spawned or when leaves should fall from trees. For local animations (fog position or falling leaf motion) its fine to let each farmhand update/render their own objects and not sync them across the network.

### Grouse
**Grouse** are "net" classes that derive from the `Monster` base class which itself descends from `INetObject<NetFields>`:

{% include embed.html link="https://github.com/jakee417/Fog-Mod/blob/main/FogMod/FogMod.Models/Grouse.cs" maxHeight=500 %}

These net classes support automatic synchronization of specified fields (location, facing direction, speed, etc) which allows seamless gameplay in coop. The grouse cycles through states as the player interacts with them (perched, surprised, flying, etc). Grouse like to spend their time "hooting" while hidden in a tree:

{% include embed/audio.html src="/assets/audio/grouse.wav" title="Grouse Hooting" %}

Once spooked, a grouse will seek another unoccupied tree far away to continue hooting. A player can try to knock down a grouse while in flight with a slingshot. If they succeed, the grouse might drop protein packed item. If the player is able to knock down enough grouse, a reward will be earned through the Adventurer Guild.

### Fog & Smoke
There are two layers to the fog; **fog bank** (bottom) and **fog clouds** (upper). The **fog clouds** are individual particles that float across the viewport. Fog cloud spawning is controlled through a "grid" that is responsible for constructing & deconstructing particles as the count deviates from a target (i.e. 3 per cell). 

{% include embed.html link="https://github.com/jakee417/Fog-Mod/blob/main/FogMod/Fog.cs" maxHeight=500 %}

This ensures an even distribution of particles and prevents clumping. The **fog bank** is the same found in the infested levels of the mines which is a sheet of larger sprites glued together and moving at the same rate. When the fog bank sprite spills over the viewport, we rotate it back to the other side of the screen, creating the "rolling" effect.

The **explosion from smoke** is the same particle as the fog clouds, just colored differently. Instead of drifting across the screen, they are exploded out radially from the source and then drift with the wind. 

{% include embed.html link="https://github.com/jakee417/Fog-Mod/blob/main/FogMod/Explosion.cs" maxHeight=500 %}

Once a grid cell is saturated with explosion smoke (i.e. 10), the cell will start cleaning up extra smoke.

## Thoughts & Roadmap
I really liked working with the net fields, they pretty much feel like magic compared to the vanilla p2p messaging. I am still thinking on new things to add, let me know what you think [here](https://github.com/jakee417/Fog-Mod/issues). In the meantime I hope you enjoy!

![foggy night market](/assets/img/custom/fog_demo.gif)
