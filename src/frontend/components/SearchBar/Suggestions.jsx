/* eslint-disable react/prop-types */
import Price from '../Price';
import styles from './SearchBar.module.css';

const Suggestions = ({
  trimmedSearchText,
  suggestionsList,
  isSuggestionsLoading,
  updateTextOnLinkClick,
}) => {
  // Validar que suggestionsList sea un array
  const validSuggestionsList = Array.isArray(suggestionsList) ? suggestionsList : [];

  if (isSuggestionsLoading)
    return (
      <section className={styles.suggestions}>
        <div className='horizontal-center'>
          <span className='loading'></span>
        </div>
      </section>
    );

  if (!trimmedSearchText) {
    return (
      <section className={styles.suggestions}>
        <div className='horizontal-center'>
          <p className={`bold ${styles.textPlease}`}>
            Ingresa el nombre del producto.
          </p>
        </div>
      </section>
    );
  }

  if (validSuggestionsList.length < 1) {
    return (
      <section className={styles.suggestions}>
        <div className='horizontal-center'>
          <p className='error-text'>No se encontraron productos ☹️</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.suggestions}>
      {validSuggestionsList.map((item) => (
        <button
          type='button'
          // navigates after onClick
          onClick={() => updateTextOnLinkClick(item)}
          key={item._id}
        >
          <p>🔍 {item.name}</p>
          <Price amount={item.price} />
        </button>
      ))}
    </section>
  );
};

export default Suggestions;