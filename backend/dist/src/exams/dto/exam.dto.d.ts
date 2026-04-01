export declare class CreateExamDto {
    title: string;
    description?: string;
    durationMin: number;
    startTime: string;
    endTime: string;
    password?: string;
}
export declare class UpdateExamDto {
    title?: string;
    description?: string;
    durationMin?: number;
    startTime?: string;
    endTime?: string;
    password?: string;
}
