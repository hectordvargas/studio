

'use client';

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronsLeft, ChevronsRight, TimerIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { psychometricCategories, technicalTests, Evaluation, Question } from "@/lib/evaluations-data";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const renderQuestion = (question: Question, questionNumber: number, totalQuestions: number) => {
    switch (question.type) {
        case 'disc':
            return (
                <div>
                    <p className="font-semibold text-lg mb-4">Grupo de adjetivos {questionNumber}:</p>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Adjetivo</th>
                                <th className="text-center py-2 w-24">MEJOR</th>
                                <th className="text-center py-2 w-24">PEOR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {question.options.map((option, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-4">{option.text}</td>
                                    <td className="py-4 text-center">
                                        <RadioGroup value={question.correctAnswer.best === option.id ? 'best' : ''}>
                                            <RadioGroupItem value="best" id={`best-${index}`} />
                                        </RadioGroup>
                                    </td>
                                    <td className="py-4 text-center">
                                         <RadioGroup value={question.correctAnswer.worst === option.id ? 'worst' : ''}>
                                            <RadioGroupItem value="worst" id={`worst-${index}`} />
                                        </RadioGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        case 'multiple-choice':
            return (
                <div>
                    <p className="font-semibold text-lg mb-4">{question.text}</p>
                    <RadioGroup value={question.correctAnswer} className="space-y-2">
                        {question.options.map(option => (
                             <div key={option.id} className={`flex items-center space-x-2 p-3 rounded-md border ${option.id === question.correctAnswer ? 'bg-green-100 border-green-300' : 'border-border'}`}>
                                <RadioGroupItem value={option.id} id={option.id} />
                                <Label htmlFor={option.id} className="flex-1 cursor-pointer">{option.text}</Label>
                                {option.id === question.correctAnswer && <Badge variant="secondary">Respuesta Correcta</Badge>}
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )
        case 'code':
            return (
                 <div>
                    <p className="font-semibold text-lg mb-4">{question.text}</p>
                    <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle className="text-base">Solución de Ejemplo (Respuesta Correcta)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-background p-4 rounded-md text-sm overflow-x-auto">
                                <code>{question.correctAnswer}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </div>
            )
        default:
            return <p>Tipo de pregunta no soportado.</p>;
    }
}

export default function EvaluationTrialPage() {
    const params = useParams<{ id: string }>();
    const allPsychometricTests = psychometricCategories.flatMap(category => category.tests);
    const allEvaluations = [...allPsychometricTests, ...technicalTests];
    const evaluation = allEvaluations.find(e => e.id === params.id);
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (evaluation) {
            const timeLimit = evaluation.questions[currentQuestionIndex]?.timeLimit;
            if (timeLimit) {
                setTimeLeft(timeLimit);
            }
        }
    }, [currentQuestionIndex, evaluation]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (evaluation && currentQuestionIndex < evaluation.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }
            return;
        };

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, currentQuestionIndex, evaluation]);

    if (!evaluation) {
        notFound();
    }
    
    const currentQuestion = evaluation.questions[currentQuestionIndex];
    const totalQuestions = evaluation.questions.length;
    const timeLimit = currentQuestion.timeLimit || 0;
    const progress = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;


    const goToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <>
            <DashboardHeader 
                title={evaluation.name}
                description="Vista de prueba de la evaluación. Como Superadministrador, puedes ver las respuestas correctas."
            >
                 <Button variant="outline" asChild>
                    <Link href="/evaluations">
                        <ArrowLeft className="mr-2" />
                        Volver al Catálogo
                    </Link>
                </Button>
            </DashboardHeader>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Pregunta {currentQuestionIndex + 1} de {totalQuestions}</CardTitle>
                            <CardDescription>{currentQuestion.instruction || evaluation.description}</CardDescription>
                        </div>
                         {timeLimit > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TimerIcon className="h-5 w-5" />
                                <div className="w-48">
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <span className="font-mono text-sm font-medium">{timeLeft}s</span>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    
                    {renderQuestion(currentQuestion, currentQuestionIndex + 1, totalQuestions)}

                    <Separator />

                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                            <ChevronsLeft className="mr-2"/>
                            Anterior
                        </Button>
                        <p className="text-sm text-muted-foreground">Página {currentQuestionIndex + 1} de {totalQuestions}</p>
                        <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === totalQuestions - 1}>
                            Siguiente
                             <ChevronsRight className="ml-2"/>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
