
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AITutor from './AITutor';

export default function Calculator({ onComplete }) {
    const [displayValue, setDisplayValue] = useState('0');
    const [operator, setOperator] = useState(null);
    const [previousValue, setPreviousValue] = useState(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const [learningGaps, setLearningGaps] = useState([]);
    const [history, setHistory] = useState([]); // State to store calculation history

    useEffect(() => {
        // Identify which operations child struggles with
        const gaps = [];
        if (history.length > 0) {
            // Consider the last 10 problems for analysis
            const recentProblems = history.slice(Math.max(0, history.length - 10));
            const operations = {};
            
            recentProblems.forEach(item => {
                const op = item.includes('+') ? 'addition' : 
                           item.includes('-') ? 'subtraction' : 
                           item.includes('×') ? 'multiplication' : 'division';
                if (!operations[op]) operations[op] = { total: 0, correct: 0 };
                operations[op].total++;
                // Simplified check for correctness: assuming any entry with '=' is a completed and correct calculation
                // In a real system, actual correctness would need to be checked against the calculated result.
                if (item.includes('=')) operations[op].correct++;
            });
            
            Object.entries(operations).forEach(([op, stats]) => {
                if (stats.total > 0 && stats.correct / stats.total < 0.6) { // If less than 60% correct for an operation
                    gaps.push(op);
                }
            });
        }
        setLearningGaps(gaps);
    }, [history]); // Re-run effect when history changes

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.pitch = 1.3;
                utterance.rate = 0.95;
                utterance.onerror = () => console.log('Voice not available');
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.log('Voice synthesis unavailable');
            }
        }
    };

    const handleDigit = (digit) => {
        if (waitingForOperand) {
            setDisplayValue(String(digit));
            setWaitingForOperand(false);
        } else {
            setDisplayValue(displayValue === '0' ? String(digit) : displayValue + digit);
        }
    };

    const handleOperator = (nextOperator) => {
        const inputValue = parseFloat(displayValue);

        if (operator && previousValue !== null) {
            const result = calculate(previousValue, inputValue, operator);
            setDisplayValue(String(result));
            setPreviousValue(result);
            // Add the intermediate calculation to history
            const displayOperator = nextOperator === '/' ? '÷' : nextOperator === '*' ? '×' : nextOperator;
            setHistory(prevHistory => [...prevHistory, `${previousValue} ${displayOperator} ${inputValue} = ${result}`]);
        } else {
            setPreviousValue(inputValue);
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    const calculate = (prev, current, op) => {
        switch (op) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return prev / current;
            default: return current;
        }
    };

    const handleEquals = () => {
        const inputValue = parseFloat(displayValue);
        if (operator && previousValue !== null) {
            const result = calculate(previousValue, inputValue, operator);
            setDisplayValue(String(result));
            // Add the final calculation to history
            const displayOperator = operator === '/' ? '÷' : operator === '*' ? '×' : operator;
            setHistory(prevHistory => [...prevHistory, `${previousValue} ${displayOperator} ${inputValue} = ${result}`]);
            setPreviousValue(null);
            setOperator(null);
            setWaitingForOperand(true);
            if (onComplete) {
                onComplete();
            }
        }
    };

    const handleClear = () => {
        setDisplayValue('0');
        setOperator(null);
        setPreviousValue(null);
        setWaitingForOperand(false);
        // History is kept for learning gap analysis.
    };

    const handleDecimal = () => {
        if (waitingForOperand) {
            setDisplayValue('0.');
            setWaitingForOperand(false);
        } else if (!displayValue.includes('.')) {
            setDisplayValue(displayValue + '.');
        }
    };

    const renderButton = (value, handler, className = "bg-gray-200 hover:bg-gray-300 text-black") => (
        <Button onClick={handler} className={`text-2xl h-16 ${className}`}>
            {value}
        </Button>
    );

    return (
        <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
            {/* AI Tutor Integration */}
            <AITutor
                childName="friend"
                childAge={8}
                currentModule="mathematics"
                currentActivity={{
                    name: 'Calculator Practice',
                    concept: 'Basic arithmetic operations'
                }}
                learningGaps={learningGaps}
                interests={['math', 'numbers', 'problem solving']}
                recentProgress={{
                    calculations_done: history.length
                }}
                onSpeakResponse={speak}
                compact={true}
            />

            {/* Rest of the calculator UI */}
            <div className="flex justify-center p-4">
                <Card className="w-full max-w-xs p-4 bg-gray-800 shadow-2xl">
                    <CardContent className="p-0">
                        <div className="bg-gray-900 text-white text-right text-4xl p-4 rounded-lg mb-4 break-all">
                            {displayValue}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {renderButton('7', () => handleDigit(7))}
                            {renderButton('8', () => handleDigit(8))}
                            {renderButton('9', () => handleDigit(9))}
                            {renderButton('÷', () => handleOperator('/'), "bg-orange-500 hover:bg-orange-600 text-white")}

                            {renderButton('4', () => handleDigit(4))}
                            {renderButton('5', () => handleDigit(5))}
                            {renderButton('6', () => handleDigit(6))}
                            {renderButton('×', () => handleOperator('*'), "bg-orange-500 hover:bg-orange-600 text-white")}

                            {renderButton('1', () => handleDigit(1))}
                            {renderButton('2', () => handleDigit(2))}
                            {renderButton('3', () => handleDigit(3))}
                            {renderButton('-', () => handleOperator('-'), "bg-orange-500 hover:bg-orange-600 text-white")}
                            
                            {/* The '0' button needs its default styling in addition to col-span-2 */}
                            {renderButton('0', () => handleDigit(0), "col-span-2 bg-gray-200 hover:bg-gray-300 text-black")}
                            {renderButton('.', handleDecimal)}
                            {renderButton('+', () => handleOperator('+'), "bg-orange-500 hover:bg-orange-600 text-white")}
                            
                            {renderButton('C', handleClear, "col-span-2 bg-red-500 hover:bg-red-600 text-white")}
                            {renderButton('=', handleEquals, "col-span-2 bg-green-500 hover:bg-green-600 text-white")}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
