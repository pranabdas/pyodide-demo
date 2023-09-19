async def parser(data):
    import micropip
    for pkg in ["lzma", "monty", "networkx", "scipy", "sqlite3", "tabulate", "uncertainties"]:
        await micropip.install(pkg)

    for custom_pkg in ["pymatgen-2023.9.10", "ruamel.yaml-0.17.32", "spglib-2.0.2"]:
        url = "/pkg/" + custom_pkg + "-py3-none-any.whl"
        await micropip.install(url, deps=False)

    from pymatgen.io.vasp import PotcarSingle
    result = PotcarSingle(data).electron_configuration

    valence_config = []
    orbital_index = 0

    for orbital in result:
        orbital_index += 1
        valence_config.append({
            "orbital_name": str(orbital[0]) + orbital[1].upper(),
            "orbital_index": orbital_index,
            "principal_number": orbital[0],
            "angular_momentum": angular_mom_from_orbital_char(orbital[1]),
            "occupation": orbital[2],
        })

    # print(valence_config)
    return valence_config

ORBITAL_DICT = {
    "0": "S",
    "1": "P",
    "2": "D",
    "3": "F",
}

INV_ORBITAL_DICT = {v: k for k, v in ORBITAL_DICT.items()}


def angular_mom_from_orbital_char(orbital):
    """
    0, 1, 2, 3 corresponding to "S", "P", "D", "F", respectively.
    """
    key = orbital.upper()

    if key in INV_ORBITAL_DICT:
        return int(INV_ORBITAL_DICT[key])
    else:
        raise ValueError(
            "Invalid orbital character, must be 'S', 'P', 'D' or 'F'" +
            " (case-insensitive).")


parser(data)
