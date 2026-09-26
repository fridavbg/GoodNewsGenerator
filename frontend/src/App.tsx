import { useAppDispatch, useAppSelector } from './store/hooks';
import { addToHistory } from './store/slices/uiSlice';

export default function App() {
  const dispatch = useAppDispatch();
  const searchHistory = useAppSelector(state => state.ui.searchHistory);

  const handleTest = () => {
    dispatch(addToHistory('test search'));
    // Debug: check localStorage
    console.log('After dispatch - localStorage:', localStorage.getItem('searchHistory'));
  };

  return (
    <div>
      <button onClick={handleTest}>Test Redux</button>
      <p>Search History: {JSON.stringify(searchHistory)}</p>
      <p>localStorage check: {localStorage.getItem('searchHistory')}</p>
    </div>
  );
}