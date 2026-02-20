import os

BASE = '/home/abhin-krishna-m-p/Desktop/CampusDine-main/client/src'

# ─── Rewrite navbar.scss completely ───────────────────────────────────────────
NAVBAR_CONTENT = '''@import "../../styles/_global.scss";

/* ─── Navbar — Mobile First ─── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  height: 60px;
  background: rgba(13, 13, 18, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  gap: 0.75rem;

  .left {
    flex-shrink: 0;
    img {
      height: 40px;
      width: auto;
    }
  }

  .mid {
    flex: 1;
    max-width: 480px;

    .search-inp {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      transition: all 0.2s;

      &:focus-within {
        border-color: rgba(240,96,48,0.4);
        background: rgba(255,255,255,0.07);
        box-shadow: 0 0 0 3px rgba(240,96,48,0.1);
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        color: $text-primary;
        font-size: 0.9rem;
        width: 100%;

        &::placeholder { color: $text-2-primary; }
      }

      .icon {
        font-size: 18px;
        color: $text-2-primary;
        cursor: pointer;
        flex-shrink: 0;
        transition: color 0.2s;

        &:hover { color: $bg-fill-color-1; }
      }
    }
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .cart-div {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(255,255,255,0.09);
        border-color: $bg-fill-color-1;
      }

      .icon {
        font-size: 20px;
        color: $text-primary;
      }

      .items-count {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        background: $bg-fill-color-1;
        color: white;
        font-size: 0.65rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        animation: scaleIn 0.2s ease;
      }
    }

    .menu-div {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;

      &:hover { background: rgba(255,255,255,0.09); }

      &.ham-open {
        border-color: $bg-fill-color-1;
        background: rgba(240,96,48,0.08);
      }

      .ham-line {
        width: 20px;
        height: 2px;
        background: $text-primary;
        border-radius: 2px;
        position: relative;
        transition: all 0.2s;

        &::before, &::after {
          content: \'\';
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: $text-primary;
          border-radius: 2px;
          transition: all 0.2s;
        }
        &::before { top: -6px; }
        &::after  { top:  6px; }
      }

      .menu-tray {
        position: absolute;
        z-index: 300;
        top: calc(100% + 10px);
        right: 0;
        width: 200px;
        background: rgba(26, 26, 38, 0.97);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.6);
        padding: 1.25rem 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        animation: scaleIn 0.18s ease both;

        img {
          height: 52px;
          width: 52px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid rgba(240,96,48,0.4);
        }

        p {
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-primary;
        }

        ul {
          width: 100%;
          margin-top: 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 0.5rem;

          li {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.6rem 0.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
            color: $text-2-primary;
            cursor: pointer;
            transition: all 0.15s;
            list-style: none;

            .icon { color: $bg-fill-color-1; font-size: 1.1rem; }

            &:hover {
              background: rgba(255,255,255,0.05);
              color: $text-primary;
            }

            &:last-child {
              color: $bg-fill-color-red;
              margin-top: 0.25rem;
              border-top: 1px solid rgba(255,255,255,0.06);
              padding-top: 0.75rem;

              .icon { color: $bg-fill-color-red; }
            }
          }
        }
      }
    }
  }

  @media (min-width: 768px) {
    height: 68px;
    padding: 0 1.5rem;

    .left img { height: 46px; }
    .right { gap: 0.75rem; }
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;

    .mid .search-inp { padding: 0.6rem 1.25rem; }
  }
}

/* ─── Bottom Navigation (mobile only) ─── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  height: 64px;
  background: rgba(13, 13, 18, 0.96);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 0.5rem;

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 0.4rem 0;
    color: $text-2-primary;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.2s;
    position: relative;
    min-height: 44px;
    cursor: pointer;

    .icon { font-size: 1.4rem; }

    span {
      font-size: 0.65rem;
      font-weight: 500;
    }

    .cart-badge {
      position: absolute;
      top: 4px;
      right: calc(50% - 18px);
      min-width: 16px;
      height: 16px;
      border-radius: 999px;
      background: $bg-fill-color-1;
      color: white;
      font-size: 0.6rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
    }

    &.active, &:hover {
      color: $bg-fill-color-1;
    }

    &.active::before {
      content: \'\';
      position: absolute;
      top: 0;
      width: 28px;
      height: 2px;
      border-radius: 0 0 4px 4px;
      background: $bg-fill-color-1;
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
}
'''

nav_path = f'{BASE}/components/navbar/navbar.scss'
with open(nav_path, 'w') as f:
    f.write(NAVBAR_CONTENT)
o = NAVBAR_CONTENT.count('{')
c = NAVBAR_CONTENT.count('}')
print(f'OK navbar.scss: {len(NAVBAR_CONTENT.splitlines())} lines, brace net={o-c}')

def fix_file(path, cut_after, description):
    with open(path) as f:
        content = f.read()
    idx = content.find(cut_after)
    if idx == -1:
        print(f"WARN: marker not found in {path}")
        lines = content.splitlines()
        for i, l in enumerate(lines[-10:], start=len(lines)-9):
            print(f"  {i}: {l!r}")
        return
    new_content = content[:idx + len(cut_after)]
    # Ensure single trailing newline
    new_content = new_content.rstrip() + '\n'
    with open(path, 'w') as f:
        f.write(new_content)
    o = new_content.count('{')
    c = new_content.count('}')
    print(f"OK {description}: {len(new_content.splitlines())} lines, brace net={o-c}")

# orders.scss: valid content ends at the closing } of .order-timestamp's outer p block
# After that old orphaned h1 { } and .order-tabs { } etc follow
fix_file(
    f'{BASE}/pages/orders/orders.scss',
    cut_after='    svg { font-size: 0.8rem; }\n  }\n}',
    description='orders.scss'
)

# lunch.scss: extra } at very end
with open(f'{BASE}/pages/lunch/lunch.scss') as f:
    content = f.read()
# Remove the last unmatched }
lines = content.splitlines()
depth = 0
for i, line in enumerate(lines):
    for c in line:
        if c == '{': depth += 1
        elif c == '}': depth -= 1
    if depth < 0:
        # Remove this line
        lines.pop(i)
        print(f"OK lunch.scss: removed extra }} at line {i+1}")
        break
new_content = '\n'.join(lines) + '\n'
o = new_content.count('{')
c2 = new_content.count('}')
print(f"   lunch.scss final: {len(lines)} lines, brace net={o-c2}")
with open(f'{BASE}/pages/lunch/lunch.scss', 'w') as f:
    f.write(new_content)

# navbar.scss: new content ends at .bottom-nav closing }
# Old content starts with .mid { after the removed .left {}
# Find the boundary - after "}\n\n\n  .mid {" (the old .mid selector)
navbar_path = f'{BASE}/components/navbar/navbar.scss'
with open(navbar_path) as f:
    content = f.read()

# The new .bottom-nav ends with its closing }
# The old content is everything starting from "  .mid {" (old navbar mid)
marker = '\n\n\n  .mid {\n'
idx = content.find(marker)
if idx == -1:
    # Try other variants
    marker = '\n\n  .mid {\n'
    idx = content.find(marker)
if idx != -1:
    new_content = content[:idx].rstrip() + '\n'
    o = new_content.count('{')
    c2 = new_content.count('}')
    print(f"OK navbar.scss: {len(new_content.splitlines())} lines, brace net={o-c2}")
    with open(navbar_path, 'w') as f:
        f.write(new_content)
else:
    print("WARN: navbar.scss marker not found. Looking for boundary...")
    lines = content.splitlines()
    depth = 0
    for i, line in enumerate(lines):
        for c in line:
            if c == '{': depth += 1
            elif c == '}': depth -= 1
        if depth < 0:
            print(f"  depth goes negative at line {i+1}: {line!r}")
            print(f"  Lines {i-3}..{i+3}:")
            for j in range(max(0,i-3), min(len(lines), i+4)):
                print(f"    {j+1}: {lines[j]!r}")
            break

print("\nFinal brace check:")
for f in ['pages/orders/orders.scss', 'pages/lunch/lunch.scss', 
          'components/navbar/navbar.scss', 'components/cartItems/cartItems.scss']:
    with open(f'{BASE}/{f}') as fh:
        c = fh.read()
    o = c.count('{'); cl = c.count('}')
    print(f"  {f.split('/')[-1]}: net={o-cl}")
