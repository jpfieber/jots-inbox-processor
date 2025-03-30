export function formatData(data: any): string {
    return JSON.stringify(data, null, 2);
}

export function manageState<T>(initialState: T): [() => T, (newState: T) => void] {
    let state = initialState;

    const getState = () => state;
    const setState = (newState: T) => {
        state = newState;
    };

    return [getState, setState];
}