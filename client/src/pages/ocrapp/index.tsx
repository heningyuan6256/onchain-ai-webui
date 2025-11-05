import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Loader2, Settings } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ModeSelector from './components/ModeSelector';
import ResultPanel from './components/ResultPanel';
// import axios from 'axios';

const API_BASE = 'http://192.168.0.95:8001';

function Ocr() {
	const [mode, setMode] = useState('ocr');
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState(null);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Form state
	const [prompt, setPrompt] = useState('');
	const [findTerm, setFindTerm] = useState('');

	const handleImageSelect = useCallback(
		(file) => {
			if (file === null) {
				// Clear everything when removing image
				setImage(null);
				if (imagePreview) {
					URL.revokeObjectURL(imagePreview);
				}
				setImagePreview(null);
				setError(null);
				setResult(null);
			} else {
				setImage(file);
				setImagePreview(URL.createObjectURL(file));
				setError(null);
				setResult(null);
			}
		},
		[imagePreview]
	);

	const handleSubmit = async () => {
		if (!image) {
			setError('Please upload an image first');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append('file', image);
			formData.append('prompt_type', mode);
			formData.append('grounding', mode === 'ocr' || mode === 'find' ? 'true' : 'false');
			findTerm && formData.append('find_term', findTerm);

			const requestOptions: RequestInit = {
				method: 'POST',
				body: formData,
				redirect: 'follow',
			};

			const response = await fetch(`${API_BASE}/ocr`, requestOptions)
				.then((res) => res.json())
				.catch((err) => {
					console.error('请求失败:', err);
				});

			setResult(response);
		} catch (err) {
			setError(err.response?.data?.detail || err.message || 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = useCallback(() => {
		if (result?.text) {
			navigator.clipboard.writeText(result.text);
		}
	}, [result]);

	const handleDownload = useCallback(() => {
		if (!result?.text) return;

		const extensions = {
			plain_ocr: 'txt',
			describe: 'txt',
			find_ref: 'txt',
			freeform: 'txt',
		};

		const ext = extensions[mode] || 'txt';
		const blob = new Blob([result.text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `deepseek-ocr-result.${ext}`;
		a.click();
		URL.revokeObjectURL(url);
	}, [result, mode]);

	return (
		<div className='min-h-screen relative overflow-hidden'>
			{/* Animated background */}
			<div className='fixed inset-0 -z-10'>
				<div className='absolute inset-0 bg-gradient-to-br ' style={{ backgroundColor: '#ffff' }} />
				<div className='absolute inset-0  opacity-30' />
				<motion.div
					className='absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl'
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
				<motion.div
					className='absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl'
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.5, 0.3, 0.5],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			</div>

			{/* Header */}
			<header className='sticky top-0 z-50 glass border-b border-white/10'>
				<div className='max-w-7xl mx-auto px-6 py-4'>
					<div className='flex items-center justify-between'></div>
				</div>
			</header>

			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-6 py-8'>
				<div className='grid lg:grid-cols-2 gap-6'>
					{/* Left Panel - Upload & Controls */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='space-y-6'>
						{/* Mode Selector with integrated inputs */}

						<ModeSelector
							mode={mode}
							onModeChange={setMode}
							prompt={prompt}
							onPromptChange={setPrompt}
							findTerm={findTerm}
							onFindTermChange={setFindTerm}
						/>

						{/* Image Upload */}
						<ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />

						{/* Action Button */}
						<motion.button
							onClick={handleSubmit}
							disabled={!image || loading}
							className={`w-full relative overflow-hidden rounded-2xl p-[2px] ${
								!image || loading ? 'opacity-50 cursor-not-allowed' : ''
							}`}
							whileHover={!loading && image ? { scale: 1.02 } : {}}
							whileTap={!loading && image ? { scale: 0.98 } : {}}
						>
							<div className='absolute inset-0 ' style={{ backgroundColor: '#282f40' }} />
							<div className='relative bg-dark-100 px-8 py-4 rounded-2xl flex items-center justify-center gap-3'>
								{loading ? (
									<>
										<Loader2 className='w-5 h-5 animate-spin' style={{ color: '#ffff' }} />
										<span className='font-semibold' style={{ color: '#ffff' }}>
											解析中...
										</span>
									</>
								) : (
									<>
										<Zap className='w-5 h-5' style={{ color: '#ffff' }} />
										<span className='font-semibold' style={{ color: '#ffff' }}>
											解析图片
										</span>
									</>
								)}
							</div>
						</motion.button>

						{error && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className='glass p-4 rounded-2xl border-red-500/50 bg-red-500/10'
							>
								<p className='text-sm text-red-400'>{error}</p>
							</motion.div>
						)}
					</motion.div>

					{/* Right Panel - Results */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
						<ResultPanel result={result} loading={loading} imagePreview={imagePreview} onCopy={handleCopy} onDownload={handleDownload} />
					</motion.div>
				</div>
			</main>
		</div>
	);
}

export default Ocr;
