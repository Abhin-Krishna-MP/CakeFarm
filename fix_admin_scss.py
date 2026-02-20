BASE = '/home/abhin-krishna-m-p/Desktop/CampusDine-main/admin/src/components'

def cut_after(path, marker):
    with open(path) as f:
        content = f.read()
    idx = content.find(marker)
    if idx == -1:
        print(f'WARN marker not found in {path}')
        return
    new_content = content[:idx + len(marker)].rstrip() + '\n'
    with open(path, 'w') as f:
        f.write(new_content)
    o = new_content.count('{'); c = new_content.count('}')
    print(f'OK {path.split("/")[-1]}: {len(new_content.splitlines())} lines, brace net={o-c}')

# orders.scss: new content ends at .hide-selected-order line
cut_after(
    f'{BASE}/orders/orders.scss',
    '.hide-selected-order { border-left-color: rgba(255,255,255,0.08) !important; }'
)

# addProduct.scss: new content ends at the closing } of .addProdCat
# Marker: the button[type='submit'] block ending then } } }
cut_after(
    f'{BASE}/addProduct/addProduct.scss',
    "        &:active { transform: scale(0.98); }\n      }\n    }\n  }\n}"
)

# userList.scss: new content ends at the } after the p block
cut_after(
    f'{BASE}/userList/userList.scss',
    "      font-weight: 600;\n      font-size: 0.88rem;\n      background: none;\n      border: none;\n      padding: 0;\n    }\n  }\n}"
)

# productList.scss: new content ends at } after .delete-icon
cut_after(
    f'{BASE}/productList/productList.scss',
    "    .save-icon   { color: #22c55e; }\n    .cancel-icon { color: #ef4444; }\n    .edit-icon   { color: #60a5fa; }\n    .delete-icon { color: #f87171; }\n  }\n}"
)

# lunchSettings.scss: new content ends at } after &:active
cut_after(
    f'{BASE}/lunchSettings/lunchSettings.scss',
    "        &:hover  { background: $bg-fill-color-1-hover; }\n        &:active { transform: scale(0.97); }\n      }\n    }\n  }\n}"
)

print('\nFinal check:')
files = ['orders/orders.scss', 'addProduct/addProduct.scss', 'userList/userList.scss',
         'productList/productList.scss', 'lunchSettings/lunchSettings.scss']
for f in files:
    with open(f'{BASE}/{f}') as fh:
        c = fh.read()
    o = c.count('{'); cl = c.count('}')
    print(f'  {f.split("/")[-1]}: {len(c.splitlines())} lines, net={o-cl}')
