# User guide

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (v2)*

How to count a group of chickens with the app. The same text is shared with field staff as a short message.

## The five steps

1. **Point the camera at the whole group.** Allow camera access the first time. Make sure every bird you want counted is in view.
2. **Tap Detect.** The picture freezes and boxes appear on the chickens. The big number is the count so far.
3. **Check the boxes** and fix mistakes (next section).
4. **Tap Add to total** when the number is right. The total at the top goes up and the camera comes back.
5. **Move to the next group** and repeat.

<!-- Add screenshots after the field test (save them in docs/assets/) and uncomment:
![Live camera](../assets/v2-live.png)
![Review and correct](../assets/v2-review.png)
![Counts list](../assets/v2-history.png)
-->

## Reading the boxes

| Colour | Meaning | What to do |
|---|---|---|
| **Green** | The model is confident this is a chicken | Nothing |
| **Amber** | The model is unsure (below 60% confidence) | Check these first: keep or remove |
| **Blue** | You added this one by hand | Tap it to delete it |
| **Red** | You removed this detection | Tap it again to bring it back |

## Fixing mistakes

| Situation | Do this | Effect on the count |
|---|---|---|
| A chicken has no box | Tap on it | +1 (a blue box appears, sized like the others) |
| A box is on something that is not a chicken, or two boxes are on one bird | Tap the box | −1 (it turns red) |
| You removed the wrong box | Tap the red box | +1 (restored) |
| The birds are tiny on screen | Use **2×** or **3×**, then drag to move around | None |
| You want to start this view over | Tap **Rescan** | Nothing is saved |

## Managing counts

- The **list button** (top right) shows every saved count, with how much you changed it, for example `model 35 +3 −1`.
- Delete a count there and the total drops by that amount. **Clear all counts** resets the total.
- The total is saved on the phone and **survives closing the app**.

## Tips for a good count (starting guidance)

These come from how the system works and will be refined with field results:

- Stand so the whole group is in the frame and the phone is steady when you tap Detect.
- Avoid counting the same birds twice: finish a group, then move to a different one.
- You need mobile signal when you tap Detect. If you have none, the app will say so and nothing is lost.

## If something goes wrong

| What you see | Meaning | What to do |
|---|---|---|
| "Network error" or "Request timed out" | No signal, or the connection is too slow | Move to better signal and tap Detect again |
| "Server error 401" | The app and server no longer share the same access token | Tell the administrator; the app may need updating ([runbook](../engineering/operations-runbook.md)) |
| "The server didn't send box positions" | The server is an older version | Tell the administrator |
| The boxes look shifted or stretched | A display bug | Take a screenshot and report it |

## Related

[Requirements](requirements.md) · [Data flow](../architecture/data-flow.md) · [Testing](../engineering/testing.md)
