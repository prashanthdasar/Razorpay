import { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import { post } from '../../utils/paytmForm';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import MetaData from '../Layouts/MetaData';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';

const Payment = () => {
    const [payDisable, setPayDisable] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');

    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error: newOrderError } = useSelector((state) => state.newOrder);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentData = {
        amount: Math.round(totalPrice),
        email: user.email,
        phoneNo: shippingInfo.phoneNo,
    };

    const submitHandler = async (e) => {
        e.preventDefault();
    
        setPayDisable(true);
    
        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
    
            const { data } = await axios.post(
                `/api/v1/process/payment`,
                paymentData,
                config,
            );
    
            console.log('Full Data from the server:', data);

if (data.razorpayOptions) {
    console.log('razorpayOptions found:', data.razorpayOptions);

    const razorpayOptions = data.razorpayOptions;
    const rzp = new window.Razorpay({
        key: razorpayOptions.key,
        amount: razorpayOptions.amount,
        currency: razorpayOptions.currency,
        order_id: razorpayOptions.orderId,
    });
    rzp.open();
} else {
    console.error('razorpayOptions is undefined');
}

            
        } catch (error) {
            setPayDisable(false);
            setError(error.message || 'An error occurred');
        }
    };
    

    useEffect(() => {
        if (newOrderError) {
            dispatch(clearErrors());
            enqueueSnackbar(newOrderError, { variant: "error" });
        }
    }, [dispatch, newOrderError, enqueueSnackbar]);


    return (
        <>
            <MetaData title="Flipkart: Secure Payment | Paytm" />

            <main className="w-full mt-20">

                {/* <!-- row --> */}
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">

                    {/* <!-- cart column --> */}
                    <div className="flex-1">

                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">

                                <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                                    <FormControl>
                                        <RadioGroup
                                            aria-labelledby="payment-radio-group"
                                            defaultValue="paytm"
                                            name="payment-radio-button"
                                            onChange={(e)=> setPaymentMethod(e.target.value)}
                                        >
                                            <FormControlLabel
                                                value="paytm"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-6 object-contain" src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png" alt="Paytm Logo" />
                                                        <span>Paytm</span>
                                                    </div>
                                                }
                                            />
                                            <FormControlLabel
                                                value="razorpay"
                                                control={<Radio />}
                                                label={
                                                    <div className="flex items-center gap-4">
                                                        <img draggable="false" className="h-6 w-6 object-contain" src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png" alt="Paytm Logo" />
                                                        <span>RazorPay</span>
                                                    </div>
                                                }
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    <input type="submit" value={`Pay ₹${totalPrice.toLocaleString()}`} disabled={payDisable ? true : false} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />

                                </form>

                                {/* stripe form */}
                                {/* <form onSubmit={(e) => submitHandler(e)} autoComplete="off" className="flex flex-col justify-start gap-3 w-full sm:w-3/4 mx-8 my-4">
                                <div>
                                    <CardNumberElement />
                                </div>
                                <div>
                                    <CardExpiryElement />
                                </div>
                                <div>
                                    <CardCvcElement />
                                </div>
                                <input ref={paymentBtn} type="submit" value="Pay" className="bg-primary-orange w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none cursor-pointer" />
                            </form> */}
                                {/* stripe form */}

                            </div>
                        </Stepper>
                    </div>

                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Payment;
