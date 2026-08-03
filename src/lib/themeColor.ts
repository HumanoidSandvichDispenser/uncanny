/**
 * Temporarily override the browser chrome color (mobile status bar / PWA
 * title bar) by rewriting the theme-color meta tags.
 */
export function overrideThemeColor(color: string): () => void {
	const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

	if (metas.length === 0) {
		const meta = document.createElement('meta');
		meta.name = 'theme-color';
		meta.content = color;
		document.head.appendChild(meta);
		return () => meta.remove();
	}

	const previous = [...metas].map((meta) => meta.content);

	for (const meta of metas) {
		meta.content = color;
	}

	return () => {
		metas.forEach((meta, i) => {
			meta.content = previous[i];
		});
	};
}
