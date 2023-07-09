


// settings Toggle
const SettingsToggle = ({func, name, initialCheck=true}) => {

    return (
        <div className="settings-toggle">
            <h1>
                {name}
            </h1>

            <label className="switch">
                <input
                    onChange={e => func(e.target.checked)}
                    // onChange={() => {func()}}
                    type="checkbox"
                    defaultChecked={initialCheck}
                />
                {initialCheck ? "true": "false"}
                <span className="slider"></span>
            </label>
        </div>
    );
}

export default SettingsToggle;
