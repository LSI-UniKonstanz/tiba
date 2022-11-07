import { usePromiseTracker } from "react-promise-tracker";
import { Bars } from 'react-loader-spinner';

//loading indicator
export default function LoadingIndicator (props) {
	const { promiseInProgress } = usePromiseTracker();
	return (
		promiseInProgress &&
		<div>
			<Bars height="45" width="55" color='lightblue'/>
		</div>
	);
}
  